import { createClient } from "@supabase/supabase-js";
import imageCompression from "browser-image-compression";

// Initialize the client once here
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * SAFETY WRAPPER
 * A helper to handle the ugly { data, error } checking for you.
 * It returns [data, null] on success or [null, error_message] on failure.
 */
async function safeRequest(request) {
  try {
    const { data, error } = await request;
    if (error) {
      console.error("Database Error:", error.message);
      return [null, error.message];
    }
    return [data, null];
  } catch (err) {
    console.error("Unexpected Error:", err);
    return [null, "An unexpected error occurred."];
  }
}

/**
 * COUNT CONFIRMED REGISTRATIONS
 * Returns the actual count of confirmed registrations for an activity
 */
async function getConfirmedCount(activityId) {
  const { count, error } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("activity_id", activityId)
    .eq("if_confirmed", true);

  if (error) {
    console.error("Error counting registrations:", error.message);
    return 0;
  }
  return count || 0;
}

/**
 * COUNT WAITLIST
 * Returns the count of users on waitlist for an activity
 */
async function getWaitlistCount(activityId) {
  const { count, error } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("activity_id", activityId)
    .eq("if_confirmed", false)
    .not("wait_list_place", "is", null);

  if (error) {
    console.error("Error counting waitlist:", error.message);
    return 0;
  }
  return count || 0;
}

/**
 * GET ALL ADMIN USER IDS
 * Returns an array of user IDs for all admin users.
 * Used to send notifications to all admins when admin-initiated messages are sent.
 */
async function getAllAdminIds() {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("role", "admin");

  if (error) {
    console.error("Error fetching admin IDs:", error.message);
    return [];
  }
  return data ? data.map((u) => u.id) : [];
}

// ==========================================================
// 1. ACTIVITIES FUNCTIONS
// ==========================================================

export const apiActivities = {
  // GET all upcoming activities
  async getAll() {
    const [activities, error] = await safeRequest(
      supabase
        .from("activities")
        .select("*")
        .gte("date", new Date().toISOString()) // Only future dates
        .order("date", { ascending: true })
    );

    if (error || !activities) {
      return [null, error];
    }

    // Get actual counts for each activity (including waitlist)
    const activitiesWithCounts = await Promise.all(
      activities.map(async (activity) => {
        const confirmedCount = await getConfirmedCount(activity.id);
        const waitlistCount = await getWaitlistCount(activity.id);
        return {
          ...activity,
          current_participants: confirmedCount,
          waitlist_count: waitlistCount,
        };
      })
    );

    return [activitiesWithCounts, null];
  },

  async getAllForUser(userId) {
    // Get all activities a user has registered for
    return safeRequest(
      supabase
        .from("activities")
        .select("*, registrations!inner(user_id)")
        .gte("date", new Date().toISOString()) // Only future dates
        .eq("registrations.user_id", userId)
        .order("date", { ascending: true })
    );
  },
  // GET activities by category
  async getByCategory(category) {
    return safeRequest(
      supabase
        .from("activities")
        .select("*")
        .eq("category", category)
        .gte("date", new Date().toISOString()) // Only future dates
        .order("date", { ascending: true })
    );
  },
  async uploadImage(file) {
    if (!file) return [null, "No file provided"];

    // 1. Compress the image before upload
    let fileToUpload = file;
    try {
      const compressionOptions = {
        maxSizeMB: 0.5, // Target max ~500KB after compression
        maxWidthOrHeight: 1920, // Good for web display
        useWebWorker: true,
      };
      fileToUpload = await imageCompression(file, compressionOptions);
      console.log(
        `Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(
          fileToUpload.size / 1024
        ).toFixed(1)}KB`
      );
    } catch (compressionError) {
      console.warn(
        "Image compression failed, uploading original:",
        compressionError
      );
      // Continue with original file if compression fails
    }

    // 2. Generate unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    // 3. Upload to 'activity_images' bucket
    const { error: uploadError } = await supabase.storage
      .from("activity_images")
      .upload(filePath, fileToUpload);

    if (uploadError) return [null, uploadError.message];

    // 4. Get Public URL
    const { data } = supabase.storage
      .from("activity_images")
      .getPublicUrl(filePath);

    return [data.publicUrl, null];
  },
  async createActivity(activityData) {
    // 1. Basic Validation
    if (!activityData.title) return [null, "Title is required"];
    if (!activityData.date) return [null, "Date is required"];

    // 2. Extract Group Logic Params
    const {
      weeks = 1,
      requires_approval = false,
      whatsapp_group_url = null,
      is_group = false,
      circle = null,
      ...baseData
    } = activityData;

    // 3. Prepare Rows
    const rowsToInsert = [];
    // Generate a unique series ID if creating more than 1 week (a Group)
    const seriesId = weeks > 1 ? crypto.randomUUID() : null;
    const startDate = new Date(baseData.date);

    for (let i = 0; i < weeks; i++) {
      // Calculate date: Start Date + (i * 7 days)
      const sessionDate = new Date(startDate);
      sessionDate.setDate(startDate.getDate() + i * 7);

      rowsToInsert.push({
        id: crypto.randomUUID(), // Generate unique ID for each session
        title: baseData.title,
        description: baseData.description,
        date: sessionDate.toISOString().split("T")[0], // Format YYYY-MM-DD
        start_time: baseData.start_time,
        end_time: baseData.end_time,
        max_participants: baseData.max_participants,
        status: baseData.status,
        category: is_group ? null : baseData.category,
        circle: is_group ? circle : null,
        location: baseData.location,
        instructor: baseData.instructor,
        image_url: baseData.image_url,
        branch: baseData.branch,
        series_id: seriesId,
        is_group: is_group,
        requires_approval: requires_approval,
        whatapp_group_url: whatsapp_group_url,
      });
    }

    // 4. Batch Insert
    return safeRequest(
      supabase.from("activities").insert(rowsToInsert).select() // Returns all created rows
    );
  },
  async getByDate(dateString) {
    const [activities, error] = await safeRequest(
      supabase
        .from("activities")
        .select("*")
        .eq("date", dateString)
        .order("start_time", { ascending: true })
    );

    if (error || !activities) {
      return [null, error];
    }

    // Get actual counts for each activity
    const activitiesWithCounts = await Promise.all(
      activities.map(async (activity) => {
        const confirmedCount = await getConfirmedCount(activity.id);
        const waitlistCount = await getWaitlistCount(activity.id);
        return {
          ...activity,
          current_participants: confirmedCount,
          waitlist_count: waitlistCount,
        };
      })
    );

    return [activitiesWithCounts, null];
  },
  async getParticipants(activityId) {
    return safeRequest(
      supabase
        .from("registrations")
        .select(
          `
          if_confirmed,
          wait_list_place,
          users (
            id,
            full_name,
            email,
            phone
          )
        `
        )
        .eq("activity_id", activityId)
    );
  },
  async update(activityId, updates) {
    // --- STEP 1: Fetch Info (Title, Old max_participants, requires_approval, series_id & Participants) ---
    const { data: activity } = await supabase
      .from("activities")
      .select(
        "title, max_participants, requires_approval, series_id, registrations(user_id)"
      )
      .eq("id", activityId)
      .single();

    const oldMaxParticipants = activity?.max_participants || 0;
    const needsApproval = activity?.requires_approval === true;
    const seriesId = activity?.series_id;

    // --- STEP 2: Get all activity IDs to update (single or series) ---
    let idsToUpdate = [activityId];
    if (seriesId) {
      const { data: seriesActs } = await supabase
        .from("activities")
        .select("id")
        .eq("series_id", seriesId);
      if (seriesActs) idsToUpdate = seriesActs.map((a) => a.id);
    }

    // --- STEP 3: Perform the Update ---
    // For series: separate updates into shared fields (apply to all) and unique fields (apply only to this activity)
    // Fields like 'date' are unique per activity in a series
    const uniqueFields = ["date"];
    const sharedUpdates = { ...updates };
    const uniqueUpdates = {};

    // Extract unique fields from shared updates
    uniqueFields.forEach((field) => {
      if (field in sharedUpdates) {
        uniqueUpdates[field] = sharedUpdates[field];
        delete sharedUpdates[field];
      }
    });

    let updateResult;

    if (seriesId && idsToUpdate.length > 1) {
      // For series: update shared fields on all activities
      if (Object.keys(sharedUpdates).length > 0) {
        await supabase
          .from("activities")
          .update(sharedUpdates)
          .in("id", idsToUpdate);
      }

      // Update unique fields only on the specific activity being edited
      if (Object.keys(uniqueUpdates).length > 0) {
        await supabase
          .from("activities")
          .update(uniqueUpdates)
          .eq("id", activityId);
      }

      // Fetch the updated activities for the result
      updateResult = await safeRequest(
        supabase.from("activities").select().in("id", idsToUpdate)
      );
    } else {
      // For single activity: update all fields
      updateResult = await safeRequest(
        supabase
          .from("activities")
          .update(updates)
          .eq("id", activityId)
          .select()
      );
    }

    const [, error] = updateResult;
    if (error) return updateResult;

    // --- STEP 4: Auto-promote waitlist if capacity increased (for ALL activities in series) ---
    const newMaxParticipants = updates.max_participants;
    if (newMaxParticipants && newMaxParticipants > oldMaxParticipants) {
      // Track which users have been notified (to avoid duplicate notifications for series)
      const notifiedUsers = new Set();

      for (const id of idsToUpdate) {
        // Get current confirmed count for this specific activity
        const confirmedCount = await getConfirmedCount(id);
        const availableSlots = newMaxParticipants - confirmedCount;

        if (availableSlots > 0) {
          // Get waitlist users ordered by position for THIS activity
          const { data: waitlistUsers } = await supabase
            .from("registrations")
            .select("id, user_id, users(email, full_name)")
            .eq("activity_id", id)
            .eq("if_confirmed", false)
            .not("wait_list_place", "is", null)
            .order("wait_list_place", { ascending: true })
            .limit(availableSlots);

          if (waitlistUsers && waitlistUsers.length > 0) {
            console.log(
              `Auto-promoting ${waitlistUsers.length} users from waitlist for activity ${id}...`
            );

            for (const waitlistUser of waitlistUsers) {
              // Promote user - if requires_approval, set status to pending for admin review
              await supabase
                .from("registrations")
                .update({
                  if_confirmed: true,
                  wait_list_place: null,
                  status: needsApproval ? "pending" : "approved",
                })
                .eq("id", waitlistUser.id);

              // Increment participant count (they now have a reserved spot)
              const { data: freshAct } = await supabase
                .from("activities")
                .select("current_participants")
                .eq("id", id)
                .single();

              if (freshAct) {
                await supabase
                  .from("activities")
                  .update({
                    current_participants:
                      (freshAct.current_participants || 0) + 1,
                  })
                  .eq("id", id);
              }

              // Only send notification/email once per user (not for each session in series)
              if (!notifiedUsers.has(waitlistUser.user_id)) {
                notifiedUsers.add(waitlistUser.user_id);

                // Send in-app notification
                const notificationMessage = needsApproval
                  ? `התפנה מקום בפעילות "${
                      activity?.title || "פעילות"
                    }". בקשתך ממתינה לאישור המנהל.`
                  : `התפנה מקום בפעילות "${
                      activity?.title || "פעילות"
                    }". נרשמת אוטומטית!`;

                await supabase.from("notifications").insert({
                  user_id: waitlistUser.user_id,
                  title: "התפנה מקום בפעילות!",
                  message: notificationMessage,
                  is_read: false,
                  created_at: new Date().toISOString(),
                  linked_activity_id: id,
                });

                // Send email (fire-and-forget)
                if (waitlistUser.users?.email) {
                  fetch("/api/send-waitlist-promotion-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: waitlistUser.users.email,
                      name: waitlistUser.users.full_name,
                      activityTitle: activity?.title || "פעילות",
                      needsApproval: needsApproval,
                    }),
                  }).catch((err) =>
                    console.error("Failed to send promotion email:", err)
                  );
                }
              }
            }

            // Reorder remaining waitlist for this activity
            await apiRegistrations.reorderWaitlist(id);
          }
        }
      }
    }

    // --- STEP 5: Notify Participants about activity changes ---
    if (
      activity &&
      activity.registrations &&
      activity.registrations.length > 0
    ) {
      console.log(
        `Notify ${activity.registrations.length} users about update...`
      );

      // Get admin IDs to also receive this notification
      const adminIds = await getAllAdminIds();
      const participantIds = activity.registrations.map((reg) => reg.user_id);
      const allRecipientIds = [...new Set([...participantIds, ...adminIds])];

      const alerts = allRecipientIds.map((userId) => ({
        user_id: userId,
        title: "פרטי הפעילות שונו ",
        message: `פרטי הפעילות "${activity.title}" עודכנו על ידי המנחה.`,
        is_read: false,
        created_at: new Date().toISOString(),
        linked_activity_id: activityId,
      }));

      await supabase.from("notifications").insert(alerts);
    }

    return updateResult;
  },
  async delete(activityId) {
    // --- STEP 1: Fetch Info (Title & Participants) ---
    const { data: activity, error: fetchError } = await supabase
      .from("activities")
      .select("title, registrations(user_id)")
      .eq("id", activityId)
      .single();

    if (fetchError) {
      return [null, "Could not find activity details to process deletion."];
    }

    const { title, registrations } = activity;

    // --- STEP 2: Notify Participants ---
    // Get admin IDs to also receive this notification
    const adminIds = await getAllAdminIds();
    const participantIds = registrations
      ? registrations.map((reg) => reg.user_id)
      : [];
    const allRecipientIds = [...new Set([...participantIds, ...adminIds])];

    if (allRecipientIds.length > 0) {
      console.log(
        `Notify ${allRecipientIds.length} users about cancellation...`
      );

      const alerts = allRecipientIds.map((userId) => ({
        user_id: userId,
        title: "הפעילות בוטלה",
        message: `הפעילות "${title}" בוטלה על ידי המנחה.`,
        is_read: false,
        created_at: new Date().toISOString(),
      }));

      // Batch insert notifications
      const { error: notifError } = await supabase
        .from("notifications")
        .insert(alerts);

      if (notifError)
        console.error(
          "Warning: Failed to send cancellation alerts",
          notifError
        );
    }

    // --- STEP 3: Delete Related Notifications ---
    // Delete all notifications that link to this activity (so "לפעילות" buttons don't lead to deleted activity)
    const { error: deleteNotifsError } = await supabase
      .from("notifications")
      .delete()
      .eq("linked_activity_id", activityId);

    if (deleteNotifsError) {
      console.error(
        "Warning: Failed to delete related notifications",
        deleteNotifsError
      );
    }

    // --- STEP 4: Delete Activity ---
    // Note: If your DB Foreign Keys are set to 'ON DELETE CASCADE', this single line
    // deletes the activity AND the registrations automatically.
    // If not, this might fail unless we manually delete registrations first.
    // We will attempt the delete directly:
    return safeRequest(
      supabase.from("activities").delete().eq("id", activityId)
    );
  },
  /**
   * GET PARTICIPANTS (Sorted: Confirmed first, then Waitlist by time)
   */
  async getParticipants(activityId) {
    return safeRequest(
      supabase
        .from("registrations")
        .select(
          `
          if_confirmed,
          created_at,
          status,
          users ( id, full_name, email, phone )
        `
        )
        .eq("activity_id", activityId)
        .order("if_confirmed", { ascending: false }) // True (Confirmed) first
        .order("created_at", { ascending: true }) // Then by time
    );
  },
  async getById(id) {
    const [activity, error] = await safeRequest(
      supabase.from("activities").select("*").eq("id", id).single()
    );

    if (error || !activity) {
      return [null, error];
    }

    // Get actual counts (source of truth)
    const confirmedCount = await getConfirmedCount(id);
    const waitlistCount = await getWaitlistCount(id);

    return [
      {
        ...activity,
        current_participants: confirmedCount,
        waitlist_count: waitlistCount,
      },
      null,
    ];
  },
  /**
   * 📢 NOTIFY PARTICIPANTS
   * Sends a custom notification to everyone registered for a specific activity.
   */
  async notifyParticipants(activityId, title, message) {
    // 1. Get all participants (Confirmed & Waitlist)
    const { data: regs, error } = await supabase
      .from("registrations")
      .select("user_id")
      .eq("activity_id", activityId);

    if (error) return [null, error.message];
    if (!regs || regs.length === 0)
      return [null, "No participants found to notify."];

    // 2. Get all admin IDs to also receive this notification
    const adminIds = await getAllAdminIds();

    // 3. Combine participant IDs and admin IDs (avoid duplicates)
    const participantIds = regs.map((r) => r.user_id);
    const allRecipientIds = [...new Set([...participantIds, ...adminIds])];

    // 4. Prepare the notification batch
    const notifications = allRecipientIds.map((userId) => ({
      user_id: userId,
      title: title,
      message: message,
      is_read: false,
      created_at: new Date().toISOString(),
      linked_activity_id: activityId,
    }));

    // 5. Send all at once
    return safeRequest(supabase.from("notifications").insert(notifications).select());
  },
  /**
   * ⭕ NOTIFY BY CIRCLE
   * Sends a notification to all users who belong to a specific circle.
   * @param {string} circleName - The name of the circle (e.g., "Year 1", "Staff")
   * @param {string} title - The title of the notification
   * @param {string} message - The body text
   */
  /**
   * 📅 NOTIFY BY DATE
   * Sends a notification to all users registered for activities on a specific date.
   * Each user receives only ONE notification, even if registered for multiple activities.
   * @param {string} dateString - The date in YYYY-MM-DD format
   * @param {string} title - The title of the notification
   * @param {string} message - The body text
   */
  async notifyByDate(dateString, title, message) {
    // 1. Get all activities on this date
    const [activities, fetchError] = await this.getByDate(dateString);
    if (fetchError) return [null, fetchError];
    if (!activities || activities.length === 0) {
      return [null, `No activities found on date: "${dateString}"`];
    }

    // 2. Get all participant IDs from all activities on this date
    const activityIds = activities.map((a) => a.id);
    const { data: regs, error: regError } = await supabase
      .from("registrations")
      .select("user_id")
      .in("activity_id", activityIds);

    if (regError) return [null, regError.message];

    // 3. Get all admin IDs
    const adminIds = await getAllAdminIds();

    // 4. Combine and deduplicate all user IDs
    const participantIds = regs ? regs.map((r) => r.user_id) : [];
    const allRecipientIds = [...new Set([...participantIds, ...adminIds])];

    if (allRecipientIds.length === 0) {
      return [null, "No users to notify for this date."];
    }

    console.log(
      `Sending to ${allRecipientIds.length} unique users for date ${dateString}`
    );

    // 5. Prepare ONE notification per user
    const notifications = allRecipientIds.map((userId) => ({
      user_id: userId,
      title: title,
      message: message,
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    // 6. Batch Insert
    return safeRequest(supabase.from("notifications").insert(notifications));
  },

  async notifyByCircle(circleName, title, message) {
    // 1. Fetch all users in this circle
    // Note: This assumes 'circle' is a direct column in your 'users' table.
    // If it is inside the quiz JSON, change to: .eq('quiz->>circle', circleName)
    const { data: users, error } = await supabase
      .from("users")
      .select("id")
      .eq("circle", circleName);

    if (error) return [null, error.message];
    if (!users || users.length === 0)
      return [null, `No users found in circle: "${circleName}"`];

    // 2. Get all admin IDs to also receive this notification
    const adminIds = await getAllAdminIds();

    // 3. Combine circle user IDs and admin IDs (avoid duplicates)
    const circleUserIds = users.map((u) => u.id);
    const allRecipientIds = [...new Set([...circleUserIds, ...adminIds])];

    console.log(
      `Sending to ${allRecipientIds.length} users (${users.length} in circle + admins)`
    );

    // 4. Prepare Notification Objects
    const notifications = allRecipientIds.map((userId) => ({
      user_id: userId,
      title: title,
      message: message,
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    // 5. Batch Insert
    return safeRequest(supabase.from("notifications").insert(notifications).select());
  },
  async getByUserPreferences(userId) {
    // 1. Define the Mapping
    const INTRESTS_MAPPING = {
      מיינדפולנס: "mindfulness",
      "גוף ותנועה": "body_motion",
      מוזיקה: "music_sound",
      "יצירה וחומר": "creation_material",
    };

    // 2. Get User's Interests (Hebrew) from the 'quiz' JSON column
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("quiz")
      .eq("id", userId)
      .single();

    // Check if user exists and has interests
    if (
      userError ||
      !user ||
      !user.quiz ||
      !user.quiz.interests ||
      user.quiz.interests.length === 0
    ) {
      console.log("No interests found for user.");
      return [[], null];
    }

    const hebrewInterests = user.quiz.interests;

    // 3. Convert to English Categories
    // We map the Hebrew terms to English. If a term isn't found in the map, we keep the original (fallback).
    const englishCategories = hebrewInterests.map(
      (interest) => INTRESTS_MAPPING[interest] || interest
    );

    // 4. Fetch Activities matching the English categories
    return safeRequest(
      supabase
        .from("activities")
        .select("*")
        .in("category", englishCategories) // 👈 Queries
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
    );
  },
};

// ==========================================================
// 2. REGISTRATIONS FUNCTIONS
// ==========================================================

export const apiRegistrations = {
  /**
   * 🔍 CHECK STATUS
   * Returns { status: 'confirmed' | 'waitlist', wait_list_place: number | null } or null
   */
  async getRegistrationStatus(userId, activityId) {
    const { data } = await supabase
      .from("registrations")
      .select("if_confirmed, wait_list_place")
      .eq("user_id", userId)
      .eq("activity_id", activityId)
      .maybeSingle();

    if (!data) return [null, null]; // Not registered
    return [
      {
        status: data.if_confirmed ? "confirmed" : "waitlist",
        wait_list_place: data.wait_list_place,
      },
      null,
    ];
  },

  /**
   * 📝 REGISTER (With Waiting List Support)
   */
  async registerUserToActivity(userId, activityId) {
    // 1. Fetch Activity Details
    const { data: activity } = await supabase
      .from("activities")
      .select(
        "id, series_id, requires_approval, max_participants, current_participants, title"
      )
      .eq("id", activityId)
      .single();

    if (!activity) return [null, "Activity not found."];

    // 2. Identify IDs (Series Logic)
    let idsToRegister = [activity.id];
    if (activity.series_id) {
      const { data: seriesActs } = await supabase
        .from("activities")
        .select("id")
        .eq("series_id", activity.series_id);

      if (seriesActs) idsToRegister = seriesActs.map((a) => a.id);
    }

    // 3. Check for existing registration
    const { data: existing } = await supabase
      .from("registrations")
      .select("id")
      .eq("user_id", userId)
      .eq("activity_id", idsToRegister[0])
      .maybeSingle();

    if (existing) return [null, "User is already registered"];

    // 4. Check Capacity (use actual count, not cached counter)
    const current = await getConfirmedCount(activityId);
    const max = activity.max_participants || 0;
    const isFull = max > 0 && current >= max;

    // 5. Determine Status
    // Status is either 'approved' (regular activities) or 'pending' (groups needing approval)
    const isApprovalNeeded = activity.requires_approval === true;
    let initialStatus = isApprovalNeeded ? "pending" : "approved";
    let initialConfirmed = true;
    let waitListPlace = null;
    let message = "Successfully registered!";

    if (isFull) {
      // Activity is full - add to waiting list
      initialConfirmed = false;

      // Get the next available wait_list_place for this activity
      const { data: waitlistEntries } = await supabase
        .from("registrations")
        .select("wait_list_place")
        .eq("activity_id", activityId)
        .eq("if_confirmed", false)
        .not("wait_list_place", "is", null)
        .order("wait_list_place", { ascending: false })
        .limit(1);

      // Next position is max + 1, or 1 if no waitlist entries exist
      waitListPlace =
        waitlistEntries && waitlistEntries.length > 0
          ? waitlistEntries[0].wait_list_place + 1
          : 1;

      if (isApprovalNeeded) {
        // Group on waitlist - will need approval when promoted (admin doesn't see yet because if_confirmed=false)
        message = `הפעילות מלאה. נרשמת לרשימת המתנה במקום #${waitListPlace}. כשיתפנה מקום, בקשתך תועבר לאישור.`;
      } else {
        // Regular activity on waitlist - auto-promoted when space opens
        message = `הפעילות מלאה. נרשמת לרשימת המתנה במקום #${waitListPlace}`;
      }
    } else if (isApprovalNeeded) {
      // Group with space available - needs admin approval, count will be incremented
      message = "בקשתך להצטרף לקבוצה נשלחה לאישור";
    }
    // else: Regular activity with space - immediate confirmation (status='approved')

    // 6. Insert Registrations
    const registrationsToInsert = idsToRegister.map((id) => ({
      user_id: userId,
      activity_id: id,
      if_confirmed: initialConfirmed,
      status: initialStatus,
      wait_list_place: isFull ? waitListPlace : null,
      created_at: new Date().toISOString(),
    }));

    const { error: regError } = await supabase
      .from("registrations")
      .insert(registrationsToInsert);

    if (regError) return [null, regError.message];

    // 7. Update Participant Counts (For all confirmed registrations, including pending groups)
    // if_confirmed=true means they have a reserved spot
    if (initialConfirmed) {
      for (const id of idsToRegister) {
        const { data: freshAct } = await supabase
          .from("activities")
          .select("current_participants")
          .eq("id", id)
          .single();

        if (freshAct) {
          await supabase
            .from("activities")
            .update({
              current_participants: (freshAct.current_participants || 0) + 1,
            })
            .eq("id", id);
        }
      }
    }

    return [
      {
        success: true,
        if_confirmed: initialConfirmed,
        wait_list_place: waitListPlace,
        status: initialStatus,
      },
      { message },
    ];
  },
  /**
   * ❌ CANCEL (With Waitlist Promotion)
   */
  async cancelRegistration(userId, activityId) {
    // 1. Get info to check series, confirmation status, and waitlist position
    const { data: regData } = await supabase
      .from("registrations")
      .select("if_confirmed, wait_list_place, activities(series_id, title)")
      .eq("user_id", userId)
      .eq("activity_id", activityId)
      .single();

    if (!regData) return [null, "Registration not found"];

    const wasConfirmed = regData.if_confirmed;
    const wasOnWaitlist = !wasConfirmed && regData.wait_list_place !== null;

    // 2. Identify IDs to delete
    let idsToDelete = [activityId];
    if (regData.activities?.series_id) {
      const { data: seriesActs } = await supabase
        .from("activities")
        .select("id")
        .eq("series_id", regData.activities.series_id);

      if (seriesActs) idsToDelete = seriesActs.map((a) => a.id);
    }

    // 3. Delete Registrations
    const { error: delError } = await supabase
      .from("registrations")
      .delete()
      .eq("user_id", userId)
      .in("activity_id", idsToDelete);

    if (delError) return [null, delError.message];

    // 4. Handle based on what type of registration was cancelled
    if (wasConfirmed) {
      // A confirmed user cancelled - need to promote from waitlist
      for (const id of idsToDelete) {
        // Decrement participant count
        const { data: act } = await supabase
          .from("activities")
          .select("current_participants")
          .eq("id", id)
          .single();

        if (act) {
          const newCount = Math.max(0, (act.current_participants || 0) - 1);
          await supabase
            .from("activities")
            .update({ current_participants: newCount })
            .eq("id", id);
        }

        // Find first person on waitlist for this activity
        const { data: firstInWaitlist } = await supabase
          .from("registrations")
          .select("id, user_id, users(email, full_name)")
          .eq("activity_id", id)
          .eq("if_confirmed", false)
          .not("wait_list_place", "is", null)
          .order("wait_list_place", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (firstInWaitlist) {
          // Check if activity requires approval (for groups)
          const { data: activityInfo } = await supabase
            .from("activities")
            .select("requires_approval")
            .eq("id", id)
            .single();

          const needsApproval = activityInfo?.requires_approval === true;

          // Promote this user - if requires_approval, set status to pending for admin review
          await supabase
            .from("registrations")
            .update({
              if_confirmed: true,
              wait_list_place: null,
              status: needsApproval ? "pending" : "approved",
            })
            .eq("id", firstInWaitlist.id);

          // Always increment participant count when promoting (they now have a reserved spot)
          const { data: freshAct } = await supabase
            .from("activities")
            .select("current_participants")
            .eq("id", id)
            .single();

          if (freshAct) {
            await supabase
              .from("activities")
              .update({
                current_participants: (freshAct.current_participants || 0) + 1,
              })
              .eq("id", id);
          }

          // Send in-app notification to promoted user
          const notificationMessage = needsApproval
            ? `התפנה מקום בפעילות "${
                regData.activities?.title || "פעילות"
              }". בקשתך ממתינה לאישור המנהל.`
            : `התפנה מקום בפעילות "${
                regData.activities?.title || "פעילות"
              }". נרשמת אוטומטית! אם אינך מעוניין/ת להשתתף, אנא בטל/י את ההרשמה.`;

          await supabase.from("notifications").insert({
            user_id: firstInWaitlist.user_id,
            title: "התפנה מקום בפעילות!",
            message: notificationMessage,
            is_read: false,
            created_at: new Date().toISOString(),
            linked_activity_id: id,
          });

          // Send email notification (fire-and-forget - don't block main flow)
          if (firstInWaitlist.users?.email) {
            fetch("/api/send-waitlist-promotion-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: firstInWaitlist.users.email,
                name: firstInWaitlist.users.full_name,
                activityTitle: regData.activities?.title || "פעילות",
                needsApproval: needsApproval,
              }),
            }).catch((err) =>
              console.error("Failed to send waitlist promotion email:", err)
            );
          }

          // Reorder remaining waitlist for this activity
          await this.reorderWaitlist(id);
        }
      }
    } else if (wasOnWaitlist) {
      // A waitlist user cancelled - just reorder the waitlist
      for (const id of idsToDelete) {
        await this.reorderWaitlist(id);
      }
    }

    return [true, null];
  },

  /**
   * 🔄 REORDER WAITLIST
   * Updates wait_list_place for all waitlist entries to be sequential (1, 2, 3...)
   */
  async reorderWaitlist(activityId) {
    // Get all waitlist entries ordered by current position
    const { data: waitlistEntries } = await supabase
      .from("registrations")
      .select("id, wait_list_place")
      .eq("activity_id", activityId)
      .eq("if_confirmed", false)
      .not("wait_list_place", "is", null)
      .order("wait_list_place", { ascending: true });

    if (!waitlistEntries || waitlistEntries.length === 0) return;

    // Update each entry with sequential position
    for (let i = 0; i < waitlistEntries.length; i++) {
      const newPosition = i + 1;
      if (waitlistEntries[i].wait_list_place !== newPosition) {
        await supabase
          .from("registrations")
          .update({ wait_list_place: newPosition })
          .eq("id", waitlistEntries[i].id);
      }
    }
  },
  /**
   * 🕵️ GET PENDING REGISTRATIONS (For Admin)
   * Fetches all registrations that are waiting for approval.
   * ✅ FIXED: Filters out duplicates so Admin only sees 1 request per Group Series.
   */
  async getPendingRegistrations() {
    // Only show pending registrations where if_confirmed=true
    // Waitlist users (if_confirmed=false) are NOT shown until promoted
    const { data, error } = await supabase
      .from("registrations")
      .select(
        `
        id,
        created_at,
        status,
        user_id,
        users (id, full_name, email, phone, circle, quiz),
        activities (id, title, start_time, date, series_id)
      `
      )
      .eq("status", "pending")
      .eq("if_confirmed", true)
      .order("created_at", { ascending: true });

    if (error) return [null, error.message];
    if (!data) return [[], null];

    // 🧹 FILTER DUPLICATES Logic
    // If a user registered for a Series (Group), we only want to show 1 request card,
    // not 4 or 10. We use a Set to track unique "User + Series" combinations.
    const uniqueRequests = [];
    const seenSeriesMap = new Set();

    data.forEach((reg) => {
      const seriesId = reg.activities?.series_id;
      const userId = reg.users?.id;

      if (seriesId) {
        // It's a Group/Series
        const uniqueKey = `${userId}_${seriesId}`;

        if (!seenSeriesMap.has(uniqueKey)) {
          seenSeriesMap.add(uniqueKey);
          uniqueRequests.push(reg); // Add only the first occurrence
        }
        // If we already saw this User+Series combo, skip this row (it's a duplicate session)
      } else {
        // It's a regular single activity, always add it
        uniqueRequests.push(reg);
      }
    });

    return [uniqueRequests, null];
  },

  /**
   * ✅ APPROVE REGISTRATION (Admin Action)
   * Approves this registration and sends notification/email to user.
   */
  async approveRegistration(registrationId) {
    // 1. Get details of the request including user info and activity title
    const { data: reg } = await supabase
      .from("registrations")
      .select(
        "user_id, activity_id, users(email, full_name), activities(title, series_id)"
      )
      .eq("id", registrationId)
      .single();

    if (!reg) return [null, "Registration not found"];

    // 2. Identify all related Activity IDs (if it's a series)
    let idsToApprove = [reg.activity_id];

    if (reg.activities?.series_id) {
      const { data: seriesActs } = await supabase
        .from("activities")
        .select("id")
        .eq("series_id", reg.activities.series_id);

      if (seriesActs) idsToApprove = seriesActs.map((a) => a.id);
    }

    // 3. Update Registration Status (Approve User)
    // Note: if_confirmed is already true (set when registering or promoted from waitlist)
    // We just change status from 'pending' to 'approved'
    const { error: updateError } = await supabase
      .from("registrations")
      .update({ status: "approved" })
      .eq("user_id", reg.user_id)
      .in("activity_id", idsToApprove);

    if (updateError) return [null, updateError.message];

    // 4. Send in-app notification to user
    await supabase.from("notifications").insert({
      user_id: reg.user_id,
      title: "בקשתך אושרה!",
      message: `בקשתך להצטרף ל"${
        reg.activities?.title || "פעילות"
      }" אושרה. נתראה!`,
      is_read: false,
      created_at: new Date().toISOString(),
      linked_activity_id: reg.activity_id,
    });

    // 5. Send email notification (fire-and-forget)
    if (reg.users?.email) {
      fetch("/api/send-registration-approval-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: reg.users.email,
          name: reg.users.full_name,
          activityTitle: reg.activities?.title || "פעילות",
        }),
      }).catch((err) =>
        console.error("Failed to send registration approval email:", err)
      );
    }

    return [{ success: true }, null];
  },

  /**
   * ❌ REJECT REGISTRATION
   * If the user had if_confirmed=true (reserved spot), decrement the count and promote from waitlist
   */
  async rejectRegistration(registrationId) {
    // 1. Get registration info to check if we need to decrement count
    const { data: reg } = await supabase
      .from("registrations")
      .select(
        "if_confirmed, user_id, activity_id, activities(series_id, title, requires_approval)"
      )
      .eq("id", registrationId)
      .single();

    if (!reg) return [null, "Registration not found"];

    const needsApproval = reg.activities?.requires_approval === true;

    // 2. Get all activity IDs (for series/groups)
    let idsToUpdate = [reg.activity_id];
    if (reg.activities?.series_id) {
      const { data: seriesActs } = await supabase
        .from("activities")
        .select("id")
        .eq("series_id", reg.activities.series_id);
      if (seriesActs) idsToUpdate = seriesActs.map((a) => a.id);
    }

    // 3. Delete all registrations for this user in the series
    const { error: delError } = await supabase
      .from("registrations")
      .delete()
      .eq("user_id", reg.user_id)
      .in("activity_id", idsToUpdate);

    if (delError) return [null, delError.message];

    // 4. If user had a confirmed spot, decrement participant count and promote from waitlist
    if (reg.if_confirmed) {
      // Track which users have been notified (to avoid duplicate notifications for series)
      const notifiedUsers = new Set();

      for (const id of idsToUpdate) {
        // Decrement participant count
        const { data: activity } = await supabase
          .from("activities")
          .select("current_participants")
          .eq("id", id)
          .single();

        if (activity) {
          const newCount = Math.max(
            0,
            (activity.current_participants || 0) - 1
          );
          await supabase
            .from("activities")
            .update({ current_participants: newCount })
            .eq("id", id);
        }

        // Find first person on waitlist for this activity
        const { data: firstInWaitlist } = await supabase
          .from("registrations")
          .select("id, user_id, users(email, full_name)")
          .eq("activity_id", id)
          .eq("if_confirmed", false)
          .not("wait_list_place", "is", null)
          .order("wait_list_place", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (firstInWaitlist) {
          // Promote this user - if requires_approval, set status to pending for admin review
          await supabase
            .from("registrations")
            .update({
              if_confirmed: true,
              wait_list_place: null,
              status: needsApproval ? "pending" : "approved",
            })
            .eq("id", firstInWaitlist.id);

          // Increment participant count (they now have a reserved spot)
          const { data: freshAct } = await supabase
            .from("activities")
            .select("current_participants")
            .eq("id", id)
            .single();

          if (freshAct) {
            await supabase
              .from("activities")
              .update({
                current_participants: (freshAct.current_participants || 0) + 1,
              })
              .eq("id", id);
          }

          // Only send notification/email once per user (not for each session in series)
          if (!notifiedUsers.has(firstInWaitlist.user_id)) {
            notifiedUsers.add(firstInWaitlist.user_id);

            // Send in-app notification to promoted user
            const notificationMessage = needsApproval
              ? `התפנה מקום בפעילות "${
                  reg.activities?.title || "פעילות"
                }". בקשתך ממתינה לאישור המנהל.`
              : `התפנה מקום בפעילות "${
                  reg.activities?.title || "פעילות"
                }". נרשמת אוטומטית! אם אינך מעוניין/ת להשתתף, אנא בטל/י את ההרשמה.`;

            await supabase.from("notifications").insert({
              user_id: firstInWaitlist.user_id,
              title: "התפנה מקום בפעילות!",
              message: notificationMessage,
              is_read: false,
              created_at: new Date().toISOString(),
              linked_activity_id: id,
            });

            // Send email notification (fire-and-forget)
            if (firstInWaitlist.users?.email) {
              fetch("/api/send-waitlist-promotion-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: firstInWaitlist.users.email,
                  name: firstInWaitlist.users.full_name,
                  activityTitle: reg.activities?.title || "פעילות",
                  needsApproval: needsApproval,
                }),
              }).catch((err) =>
                console.error("Failed to send waitlist promotion email:", err)
              );
            }
          }

          // Reorder remaining waitlist for this activity
          await this.reorderWaitlist(id);
        }
      }
    }

    return [{ success: true }, null];
  },
};

// ==========================================================
// 3. NOTIFICATIONS FUNCTIONS
// ==========================================================

export const apiNotifications = {
  /**
   * GET NOTIFICATIONS
   * Fetches notifications for a user.
   * @param {string} userId - The current user's ID.
   * @param {number} limit - How many to fetch (default 20).
   * @param {boolean} onlyUnread - If true, only shows unread items.
   */
  async getList(userId, limit = 20, onlyUnread = false) {
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }) // Newest first
      .limit(limit);

    if (onlyUnread) {
      query = query.eq("is_read", false);
    }

    return safeRequest(query);
  },

  /**
   * COUNT UNREAD
   * Good for showing the red badge number (e.g., "3 new messages").
   */
  async getUnreadCount(userId) {
    // count: 'exact' gives us the number without downloading all the rows
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error counting notifications:", error.message);
      return 0;
    }
    return count;
  },

  /**
   * MARK ONE AS READ
   * Call this when a user clicks/taps a specific notification.
   */
  async markAsRead(notificationId) {
    return safeRequest(
      supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
    );
  },

  /**
   * MARK ALL AS READ
   * A "Clear All" button feature.
   */
  async markAllAsRead(userId) {
    return safeRequest(
      supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false) // Only update ones that are currently unread
    );
  },
  async markAsUnread(notificationId) {
    return safeRequest(
      supabase
        .from("notifications")
        .update({ is_read: false })
        .eq("id", notificationId)
    );
  },

  async delete(notificationId) {
    return safeRequest(
      supabase.from("notifications").delete().eq("id", notificationId)
    );
  },

  /**
   * SEND NOTIFICATION (System Use)
   * Use this when an event happens (e.g., "Activity Confirmed").
   */
  async send(userId, title, message) {
    return safeRequest(
      supabase.from("notifications").insert([
        {
          user_id: userId,
          title: title,
          message: message,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ])
    );
  },
  subscribe(userId, onNewNotification) {
    return supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => onNewNotification(payload.new)
      )
      .subscribe();
  },

  /**
   * GET ALL NOTIFICATIONS (Admin View)
   * Fetches all notifications in the system, regardless of user.
   * Used by admin to see all sent messages.
   * @param {number} limit - How many to fetch (default 50).
   */
  async getAll(limit = 50) {
    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    return safeRequest(query);
  },

  /**
   * SUBSCRIBE TO ALL NOTIFICATIONS (Admin View)
   * Listen for any new notification in the system.
   */
  subscribeAll(onNewNotification) {
    return supabase
      .channel("public:notifications:all")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => onNewNotification(payload.new)
      )
      .subscribe();
  },
  /**
   * 📢 NOTIFY ALL USERS
   * Sends a notification to every user in the database (including admins).
   */
  async notifyAllUsers(title, message) {
    // 1. Get all user IDs
    const { data: users, error } = await supabase
      .from("users")
      .select("id");

    if (error) return [null, error.message];
    if (!users || users.length === 0)
      return [null, "No users found in the system."];

    // 2. Prepare Notification Objects
    const notifications = users.map((user) => ({
      user_id: user.id,
      title: title,
      message: message,
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    console.log(`Sending broadcast to ${users.length} users.`);

    // 3. Batch Insert
    return safeRequest(supabase.from("notifications").insert(notifications).select());
  },
};

// ==========================================================
// 4. USER PROFILE FUNCTIONS
// ==========================================================
export const apiUser = {
  // Existing getProfile...
  async getProfile(userId) {
    return safeRequest(
      supabase.from("users").select("*").eq("id", userId).single()
    );
  },

  // 👇 NEW: Create a brand new user for testing
  async createTestUser() {
    // 1. Generate random credentials
    const randId = "d5ab6f2b-5359-472f-88ac-a3e565b2e79f"; // Use a fixed ID for easier cleanup
    const email = `testuser${randId}@example.com`;
    const password = "password123";
    const fullName = `Test User ${randId}`;

    console.log(`Attempting to create: ${email}`);

    // 2. Sign Up (Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return [null, authError.message];
    const newUserId = authData.user?.id;

    if (!newUserId) return [null, "Auth succeeded but no ID returned."];

    // 3. Create Public Profile (Using UPSERT to be safe against triggers)
    const { error: profileError } = await supabase.from("users").upsert({
      id: randId,
      full_name: fullName,
      email: email,
    });

    if (profileError) {
      console.error("Profile creation failed:", profileError.message);
      return [
        null,
        "Auth created, but profile failed: " + profileError.message,
      ];
    }

    return [{ id: randId, email, password }, null];
  },
  // Add this inside the apiUser object

  /**
   * CREATE NEW ADMIN
   */
  async createAdmin(email, password, fullName, phone, gender) {
    // 👈 Added phone parameter
    // 1. Sign Up the new user (Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone }, // Save metadata to Auth user as well
      },
    });

    if (authError) return [null, authError.message];

    const newUserId = authData.user?.id;
    if (!newUserId) return [null, "Auth succeeded but no ID returned."];

    const adminQuiz = {
      circle: null,
      free_text: null,
      interests: [],
      proximity: null,
      completed_at: new Date().toISOString(),
    };

    // 2. Insert into 'users' table with ADMIN role
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: newUserId,
        full_name: fullName,
        email: email,
        phone: phone, // 👈 Save phone to DB
        role: "admin",
        gender: gender,
        is_approved: true,
        quiz: adminQuiz,
      },
    ]);

    if (profileError) {
      return [
        null,
        "User created, but database insert failed: " + profileError.message,
      ];
    }

    return [{ id: newUserId, email }, null];
  },
  async checkIfAdmin(userId) {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Check Admin Error:", error.message);
      return [false, error.message]; // Default to false on error
    }

    // Assumes your enum or text string is exactly 'admin'
    const isAdmin = data?.role === "admin";
    return [isAdmin, null];
  },
  async createUserFromAuth(user) {
    return safeRequest(
      supabase.from("users").insert([
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name || "New User",
        },
      ])
    );
  },
  /**
   * 📋 GET ALL USERS
   * Fetches all users, ordered by those pending approval first.
   */
  async getAllUsers() {
    return safeRequest(
      supabase
        .from("users")
        .select("*")
        .order("is_approved", { ascending: true }) // Unapproved first
        .order("created_at", { ascending: false }) // Newest first
    );
  },

  /**
   * ✅ APPROVE USER
   * Sets is_approved to true.
   */
  async approveUser(userId) {
    return safeRequest(
      supabase.from("users").update({ is_approved: true }).eq("id", userId)
    );
  },

  /**
   * 🗑️ DELETE USER
   * Deletes the user profile.
   * Note: This deletes from the public 'users' table.
   * If you need to delete from Supabase Auth as well, that requires a backend Edge Function.
   */
  async deleteUser(userId) {
    return safeRequest(supabase.from("users").delete().eq("id", userId));
  },
  /**
   * 🏷️ UPDATE INTERESTS
   * Updates only the 'interests' array inside the 'quiz' JSON column.
   */
  async updateUserInterests(userId, newInterests) {
    // 1. Fetch current profile to get existing quiz data (to preserve 'circle', etc.)
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("quiz")
      .eq("id", userId)
      .single();

    if (fetchError) return [null, fetchError.message];

    // 2. Merge new interests with existing quiz data
    const currentQuiz = user.quiz || {};
    const updatedQuiz = {
      ...currentQuiz,
      interests: newInterests, // Overwrite interests
    };

    // 3. Save back to DB
    return safeRequest(
      supabase.from("users").update({ quiz: updatedQuiz }).eq("id", userId)
    );
  },
  /**
   * 🌿 GET USER BRANCHES
   * Fetches the preferred branches for a user.
   * Returns ['nahalal', 'satria'] if the field is null/empty.
   */
  async getUserBranches(userId) {
    const { data, error } = await supabase
      .from("users")
      .select("branches")
      .eq("id", userId)
      .single();

    if (error) return [null, error.message];

    // Default to BOTH if null or empty array
    const branches =
      data?.branches && data.branches.length > 0
        ? data.branches
        : ["nahalal", "satria"];

    return [branches, null];
  },
  /**
   * 🌿 UPDATE USER BRANCHES
   * Saves the user's preferred branches (e.g. ['nahalal', 'satria'])
   */
  async updateUserBranches(userId, branchesArray) {
    return safeRequest(
      supabase
        .from("users")
        .update({ branches: branchesArray })
        .eq("id", userId)
    );
  },
  async updateUserPhone(userId, newPhone) {
    return safeRequest(
      supabase.from("users").update({ phone: newPhone }).eq("id", userId)
    );
  },

  /**
   * 📊 GET USER ACTIVITY STATS
   * Returns count of groups and workshops the user is registered for
   * Groups with multiple sessions (same series_id) are counted as one group
   */
  async getUserActivityStats(userId) {
    // Get all registrations for this user with activity details including series_id
    const { data: registrations, error } = await supabase
      .from("registrations")
      .select("activity_id, activities!inner(id, is_group, series_id)")
      .eq("user_id", userId)
      .eq("if_confirmed", true);

    if (error) {
      console.error("Error fetching user stats:", error.message);
      return [{ groups: 0, workshops: 0 }, null];
    }

    if (!registrations || registrations.length === 0) {
      return [{ groups: 0, workshops: 0 }, null];
    }

    // Count groups vs workshops
    // For groups, use Set to count unique series_ids (avoid counting multiple sessions as separate groups)
    const uniqueGroupSeriesIds = new Set();
    let workshopCount = 0;

    registrations.forEach((reg) => {
      if (reg.activities?.is_group) {
        // Use series_id if available, otherwise use activity_id as fallback
        const groupId = reg.activities.series_id || reg.activities.id;
        uniqueGroupSeriesIds.add(groupId);
      } else {
        workshopCount++;
      }
    });

    return [
      { groups: uniqueGroupSeriesIds.size, workshops: workshopCount },
      null,
    ];
  },
};

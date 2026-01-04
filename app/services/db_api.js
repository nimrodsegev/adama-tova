import { createClient } from "@supabase/supabase-js";

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

// ==========================================================
// 1. ACTIVITIES FUNCTIONS
// ==========================================================

export const apiActivities = {
  // GET all upcoming activities
  async getAll() {
    return safeRequest(
      supabase
        .from("activities")
        .select("*")
        .gte("date", new Date().toISOString()) // Only future dates
        .order("date", { ascending: true })
    );
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
  async getByUserPreferences(userId) {
    // 1. Get User's Interests from the 'quiz' JSON column
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
      return [[], null]; // Return empty list if no interests found
    }

    const userInterests = user.quiz.interests; // Example: ["Music", "Technology"]

    // 2. Fetch Activities matching those categories
    return safeRequest(
      supabase
        .from("activities")
        .select("*")
        .in("category", userInterests) // 👈 Magic line: Checks if category is inside the array
        .gte("date", new Date().toISOString()) // Optional: Only show future events
        .order("date", { ascending: true })
    );
  },

  // GET a single activity by ID
  async getById(id) {
    return safeRequest(
      supabase.from("activities").select("*").eq("id", id).single()
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

    // 1. Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    // 2. Upload to 'activity_images' bucket
    const { error: uploadError } = await supabase.storage
      .from('activity_images')
      .upload(filePath, file);

    if (uploadError) return [null, uploadError.message];

    // 3. Get Public URL
    const { data } = supabase.storage
      .from('activity_images')
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
      sessionDate.setDate(startDate.getDate() + (i * 7));

      rowsToInsert.push({
        id: crypto.randomUUID(), // Generate unique ID for each session
        title: baseData.title,
        description: baseData.description,
        date: sessionDate.toISOString().split('T')[0], // Format YYYY-MM-DD
        start_time: baseData.start_time,
        end_time: baseData.end_time,
        max_participants: baseData.max_participants,
        status: baseData.status,
        category: baseData.category,
        location: baseData.location,
        instructor: baseData.instructor,
        image_url: baseData.image_url,
        branch: baseData.branch,
        // 👇 New Group Fields
        series_id: seriesId,
        requires_approval: requires_approval
      });
    }

    // 4. Batch Insert
    return safeRequest(
      supabase
        .from("activities")
        .insert(rowsToInsert)
        .select() // Returns all created rows
    );
  },
  async getByDate(dateString) {
    return safeRequest(
      supabase
        .from("activities")
        .select("*")
        .eq("date", dateString)
        .order("start_time", { ascending: true }) // Shows 09:00 before 14:00
    );
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
    // --- STEP 1: Fetch Info (Title & Participants) ---
    const { data: activity } = await supabase
      .from('activities')
      .select('title, registrations(user_id)')
      .eq('id', activityId)
      .single();

    // --- STEP 2: Perform the Update ---
    const updateResult = await safeRequest(
      supabase
        .from('activities')
        .update(updates)
        .eq('id', activityId)
        .select()
    );

    const [data, error] = updateResult;
    if (error) return updateResult;

    // --- STEP 3: Notify Participants ---
    if (activity && activity.registrations && activity.registrations.length > 0) {
      console.log(`Notify ${activity.registrations.length} users about update...`);
      
      const alerts = activity.registrations.map(reg => ({
        user_id: reg.user_id,
        title: "פרטי הפעילות שונו ✏️",
        message: `פרטי הפעילות "${activity.title}" עודכנו על ידי המנחה.`,
        is_read: false,
        created_at: new Date().toISOString(),
        linked_activity_id: activityId 
      }));

      await supabase.from('notifications').insert(alerts);
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
    if (registrations && registrations.length > 0) {
      console.log(`Notify ${registrations.length} users about cancellation...`);

      const alerts = registrations.map((reg) => ({
        user_id: reg.user_id,
        title: "הפעילות בוטלה ⚠️",
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

    // --- STEP 3: Delete Activity ---
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
          users ( full_name, email, phone )
        `
        )
        .eq("activity_id", activityId)
        .order("if_confirmed", { ascending: false }) // True (Confirmed) first
        .order("created_at", { ascending: true }) // Then by time
    );
  },
  async getById(id) {
    return safeRequest(
      supabase.from("activities").select("*").eq("id", id).single()
    );
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

    // 2. Prepare the notification batch
    const notifications = regs.map((r) => ({
      user_id: r.user_id,
      title: title,
      message: message,
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    // 3. Send all at once
    return safeRequest(supabase.from("notifications").insert(notifications));
  },
  /**
   * ⭕ NOTIFY BY CIRCLE
   * Sends a notification to all users who belong to a specific circle.
   * @param {string} circleName - The name of the circle (e.g., "Year 1", "Staff")
   * @param {string} title - The title of the notification
   * @param {string} message - The body text
   */
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

    console.log(`Sending to ${users.length} users in circle ${circleName}`);

    // 2. Prepare Notification Objects
    const notifications = users.map((u) => ({
      user_id: u.id,
      title: title,
      message: message,
      is_read: false,
      created_at: new Date().toISOString(),
    }));

    // 3. Batch Insert
    return safeRequest(supabase.from("notifications").insert(notifications));
  },
  async getByUserPreferences(userId) {
    // 1. Define the Mapping
    const INTRESTS_MAPPING = {
      'מדיטציה': 'Meditation',
      'יוגה': 'Yoga',
      'אומנות': 'Art',
      'כתיבה': 'Writing',
      'מיינדפולנס': 'Mindfulness',
      'יצירה': 'Crafts',
      // Add more as needed
    };

    // 2. Get User's Interests (Hebrew) from the 'quiz' JSON column
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('quiz')
      .eq('id', userId)
      .single();

    // Check if user exists and has interests
    if (userError || !user || !user.quiz || !user.quiz.interests || user.quiz.interests.length === 0) {
      console.log("No interests found for user.");
      return [[], null]; 
    }

    const hebrewInterests = user.quiz.interests; // Example: ["יוגה", "אומנות"]

    // 3. Convert to English Categories
    // We map the Hebrew terms to English. If a term isn't found in the map, we keep the original (fallback).
    const englishCategories = hebrewInterests.map(interest => 
      INTRESTS_MAPPING[interest] || interest
    );

    // 4. Fetch Activities matching the English categories
    return safeRequest(
      supabase
        .from('activities')
        .select('*')
        .in('category', englishCategories) // 👈 Queries using: ['Yoga', 'Art']
        .gte('date', new Date().toISOString()) 
        .order('date', { ascending: true })
    );
  },
};

// ==========================================================
// 2. REGISTRATIONS FUNCTIONS
// ==========================================================

export const apiRegistrations = {
  /**
   * 🔍 CHECK STATUS
   * Returns 'confirmed', 'waitlist', or null
   */
  async getRegistrationStatus(userId, activityId) {
    const { data } = await supabase
      .from("registrations")
      .select("if_confirmed")
      .eq("user_id", userId)
      .eq("activity_id", activityId)
      .maybeSingle();

    if (!data) return [null, null]; // Not registered
    return [data.if_confirmed ? "confirmed" : "waitlist", null];
  },

  /**
   * 📝 REGISTER (Fixed - No SQL Needed)
   */
  async registerUserToActivity(userId, activityId) {
    // 1. Fetch Activity Details
    const { data: activity } = await supabase
      .from("activities")
      .select("id, series_id, requires_approval, max_participants, current_participants")
      .eq("id", activityId)
      .single();

    if (!activity) return [null, "Activity not found."];

    // 2. Identify all IDs to register for (Series logic)
    let idsToRegister = [activity.id];

    if (activity.series_id) {
      const { data: seriesActivities } = await supabase
        .from("activities")
        .select("id")
        .eq("series_id", activity.series_id);
      
      if (seriesActivities) {
        idsToRegister = seriesActivities.map(a => a.id);
      }
    }

    // 3. Determine Status
    const isApprovalNeeded = activity.requires_approval;
    const current = activity.current_participants || 0;
    const max = activity.max_participants || 0;
    const isFull = current >= max;

    let initialStatus = 'approved';
    let initialConfirmed = !isFull;
    let message = "Successfully registered! ✅";

    if (isApprovalNeeded) {
      initialStatus = 'pending';
      initialConfirmed = false;
      message = "Request sent to admin for approval ⏳";
    } else if (isFull) {
      message = "Activity is full. You are on the waitlist ⏳";
    }

    // 4. Check for existing registration (Fixes 406 Error)
    const { data: existing } = await supabase
      .from("registrations")
      .select("id")
      .eq("user_id", userId)
      .eq("activity_id", idsToRegister[0])
      .maybeSingle(); // 👈 Uses maybeSingle to avoid errors if no row exists

    if (existing) return [null, "User is already registered"];

    // 5. Insert Registrations
    const registrationsToInsert = idsToRegister.map(id => ({
      user_id: userId,
      activity_id: id,
      if_confirmed: initialConfirmed,
      status: initialStatus,
      created_at: new Date().toISOString(),
    }));

    const { error: regError } = await supabase
      .from("registrations")
      .insert(registrationsToInsert);

    if (regError) return [null, regError.message];

    // 6. Update Participant Counts (Fixes 404 & 400 Errors)
    // We update manually in a loop instead of calling a missing SQL function
    if (initialConfirmed && !isApprovalNeeded) {
      for (const id of idsToRegister) {
        // A. Get fresh count for this specific session
        const { data: freshAct } = await supabase
          .from('activities')
          .select('current_participants')
          .eq('id', id)
          .single();
        
        if (freshAct) {
          // B. Update correctly using .update()
          await supabase
            .from("activities")
            .update({ current_participants: (freshAct.current_participants || 0) + 1 })
            .eq('id', id);
        }
      }
    }

    return [{ success: true }, { message }];
  },
  /**
   * ❌ CANCEL
   */
  async cancelRegistration(userId, activityId) {
    // 1. Get info before delete (to check if it's a series and if user was confirmed)
    const { data: regData } = await supabase
      .from("registrations")
      .select("if_confirmed, activities(series_id)")
      .eq("user_id", userId)
      .eq("activity_id", activityId)
      .single();

    if (!regData) return [null, "Registration not found"];

    // 2. Identify all IDs to delete (Series logic)
    let idsToDelete = [activityId];
    
    // If it's part of a group series, find all other session IDs
    if (regData.activities?.series_id) {
       const { data: seriesActs } = await supabase
        .from("activities")
        .select("id")
        .eq("series_id", regData.activities.series_id);
       
       if (seriesActs) idsToDelete = seriesActs.map(a => a.id);
    }

    // 3. Delete Registrations
    const { error: delError } = await supabase
      .from("registrations")
      .delete()
      .eq("user_id", userId)
      .in("activity_id", idsToDelete);

    if (delError) return [null, delError.message];

    // 4. Decrement Participant Count (Only if the user was actually confirmed)
    // We update each session manually to be safe.
    if (regData.if_confirmed) {
       for (const id of idsToDelete) {
          // A. Fetch current count
          const { data: act } = await supabase
            .from('activities')
            .select('current_participants')
            .eq('id', id)
            .single();
          
          if (act) {
            // B. Calculate new count (ensure it doesn't drop below 0)
            const newCount = Math.max(0, (act.current_participants || 0) - 1);
            
            // C. Update
            await supabase
              .from('activities')
              .update({ current_participants: newCount })
              .eq('id', id);
          }
       }
    }

    return [true, null];
  },
  /**
   * 🕵️ GET PENDING REGISTRATIONS (For Admin)
   * Fetches all registrations that are waiting for approval.
   * ✅ FIXED: Filters out duplicates so Admin only sees 1 request per Group Series.
   */
  async getPendingRegistrations() {
    const { data, error } = await supabase
      .from("registrations")
      .select(`
        id,
        created_at,
        status,
        user_id, 
        users (id, full_name, email, phone),
        activities (id, title, start_time, date, series_id)
      `)
      .eq("status", "pending")
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
   * Approves this registration AND increments participant counts for all sessions.
   */
  async approveRegistration(registrationId) {
    // 1. Get details of the request
    const { data: reg } = await supabase
      .from("registrations")
      .select("user_id, activity_id, activities(series_id)")
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
       
       if (seriesActs) idsToApprove = seriesActs.map(a => a.id);
    }

    // 3. Update Registration Status (Approve User)
    const { error: updateError } = await supabase
        .from("registrations")
        .update({ status: 'approved', if_confirmed: true })
        .eq("user_id", reg.user_id)
        .in("activity_id", idsToApprove);

    if (updateError) return [null, updateError.message];

    // 4. 👇 NEW: Increment Participant Count for ALL sessions
    // We loop through to ensure every single session date gets updated.
    for (const id of idsToApprove) {
      // A. Fetch current count
      const { data: activity } = await supabase
        .from("activities")
        .select("current_participants")
        .eq("id", id)
        .single();
      
      if (activity) {
        const newCount = (activity.current_participants || 0) + 1;
        
        // B. Update with new count
        await supabase
          .from("activities")
          .update({ current_participants: newCount })
          .eq("id", id);
      }
    }

    return [{ success: true }, null];
  },

  /**
   * ❌ REJECT REGISTRATION
   */
  async rejectRegistration(registrationId) {
    // We simply delete the request so they can try again or it disappears
    return safeRequest(
      supabase.from("registrations").delete().eq("id", registrationId)
    );
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
  async createAdmin(email, password, fullName, phone) {
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

    // 2. Insert into 'users' table with ADMIN role
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: newUserId,
        full_name: fullName,
        email: email,
        phone: phone, // 👈 Save phone to DB
        role: "admin",
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
      .from('users')
      .select('branches')
      .eq('id', userId)
      .single();

    if (error) return [null, error.message];

    // Default to BOTH if null or empty array
    const branches = (data?.branches && data.branches.length > 0) 
      ? data.branches 
      : ['nahalal', 'satria'];

    return [branches, null];
  },
  /**
   * 🌿 UPDATE USER BRANCHES
   * Saves the user's preferred branches (e.g. ['nahalal', 'satria'])
   */
  async updateUserBranches(userId, branchesArray) {
    return safeRequest(
      supabase
        .from('users')
        .update({ branches: branchesArray })
        .eq('id', userId)
    );
  },
  async updateUserPhone(userId, newPhone) {
    return safeRequest(
      supabase
        .from('users')
        .update({ phone: newPhone })
        .eq('id', userId)
    );
  },
};

import { createClient } from "@supabase/supabase-js";

// Initialize the client once here
const supabaseUrl = "https://xkiocfbptkujbzxhyvuy.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhraW9jZmJwdGt1amJ6eGh5dnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTU2ODMsImV4cCI6MjA4MDkzMTY4M30.YDj6te6LCGswNWTovPlANZyyVVbMNa8JwcP-mpRavzQ";
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
    const randomDigit = crypto.randomUUID();
    activityData.id = randomDigit;
    // 2. Insert into DB
    return safeRequest(
      supabase
        .from("activities")
        .insert([
          {
            id: activityData.id,
            title: activityData.title,
            description: activityData.description,
            date: activityData.date,
            start_time: activityData.start_time,
            end_time: activityData.end_time,
            max_participants: activityData.max_participants,
            status: activityData.status,
            category: activityData.category,
            location: activityData.location,
            instructor: activityData.instructor,
            image_url: activityData.image_url,
          },
        ])
        .select()
        .single()
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
   * 📝 REGISTER (Smart Waitlist Logic)
   */
  async registerUserToActivity(userId, activityId) {
    // 1. Check if already registered
    const { data: existing } = await supabase
      .from("registrations")
      .select("id, if_confirmed")
      .eq("user_id", userId)
      .eq("activity_id", activityId)
      .single();

    if (existing) {
      const status = existing.if_confirmed ? "confirmed" : "waitlist";
      return [null, `User is already ${status}`];
    }

    // 2. Fetch Capacity
    const { data: activity } = await supabase
      .from("activities")
      .select("title, max_participants, current_participants")
      .eq("id", activityId)
      .single();

    if (!activity) return [null, "Activity not found."];

    const current = activity.current_participants || 0;
    const max = activity.max_participants || 0;
    const isFull = current >= max;

    // 3. Register User
    // If Full -> if_confirmed: false (Waitlist)
    const { data: newReg, error: regError } = await supabase
      .from("registrations")
      .insert([
        {
          user_id: userId,
          activity_id: activityId,
          if_confirmed: !isFull,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (regError) return [null, regError.message];

    // 4. Update Counter (Only if confirmed)
    let message = "Successfully registered! ✅";
    if (!isFull) {
      await supabase
        .from("activities")
        .update({ current_participants: current + 1 })
        .eq("id", activityId);
    } else {
      message = "Activity is full. You are on the waitlist ⏳";
    }

    return [newReg, { message }]; // Return success object with message
  },

  /**
   * ❌ CANCEL (Auto-Promote Next Person)
   */
  async cancelRegistration(userId, activityId) {
    // 1. Check who is cancelling
    const { data: leavingUser } = await supabase
      .from("registrations")
      .select("if_confirmed")
      .eq("user_id", userId)
      .eq("activity_id", activityId)
      .single();

    if (!leavingUser) return [null, "Registration not found"];

    // 2. Delete the registration
    const { error: delError } = await supabase
      .from("registrations")
      .delete()
      .eq("user_id", userId)
      .eq("activity_id", activityId);

    if (delError) return [null, delError.message];

    // 3. IF A CONFIRMED USER LEFT -> Promote the next person
    if (leavingUser.if_confirmed) {
      // A. Find the first person on waitlist (Oldest created_at)
      const { data: waiter } = await supabase
        .from("registrations")
        .select("id, user_id")
        .eq("activity_id", activityId)
        .eq("if_confirmed", false)
        .order("created_at", { ascending: true }) // First in line
        .limit(1)
        .single();

      if (waiter) {
        // B. PROMOTE THEM
        console.log("Promoting user:", waiter.user_id);

        // Update registration to confirmed
        await supabase
          .from("registrations")
          .update({ if_confirmed: true })
          .eq("id", waiter.id);

        // Notify them
        const { data: act } = await supabase
          .from("activities")
          .select("title")
          .eq("id", activityId)
          .single();
        await supabase.from("notifications").insert([
          {
            user_id: waiter.user_id,
            title: "You're In! 🎉",
            message: `A spot opened up in "${
              act?.title || "Activity"
            }" and you have been automatically registered.`,
            is_read: false,
          },
        ]);

        // Note: We DO NOT decrement current_participants because one left (-1) and one entered (+1).
      } else {
        // C. NO WAITLIST? Just decrement the count
        const { data: activity } = await supabase
          .from("activities")
          .select("current_participants")
          .eq("id", activityId)
          .single();

        const newCount = Math.max(0, (activity.current_participants || 0) - 1);
        await supabase
          .from("activities")
          .update({ current_participants: newCount })
          .eq("id", activityId);
      }
    }

    return [true, null];
  },

  async getUserRegistrationIds(userId) {
    const { data, error } = await supabase
      .from("registrations")
      .select("activity_id")
      .eq("user_id", userId);
    if (error) return [[], error.message];
    return [data.map((r) => r.activity_id), null];
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
};

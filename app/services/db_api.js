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
            description: activityData.description, // Default to empty string if missing
            date: activityData.date,
            start_time: activityData.start_time,
            end_time: activityData.end_time,
            max_participants: activityData.max_participants,
            status: activityData.status,
            category: activityData.category,
          },
        ])
        .select()
        .single()
    );
  },
};

// ==========================================================
// 2. REGISTRATIONS FUNCTIONS
// ==========================================================

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

  /**
   * REAL-TIME LISTENER
   * Call this in your main App component to listen for incoming alerts.
   * @param {string} userId - Who are we listening for?
   * @param {function} onNewNotification - Callback function to run when data arrives.
   * @returns {object} subscription - The subscription object (call .unsubscribe() on cleanup).
   */
  subscribe(userId, onNewNotification) {
    return supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`, // Only listen for MY notifications
        },
        (payload) => {
          console.log("New Notification Received!", payload.new);
          onNewNotification(payload.new);
        }
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
};

const User=require('../models/user.model');
const Notification=require('../models/notification.model');

exports.sendNotifications = async ({ title, message, userIds }) => {
    try {
        if (!title || !message || !Array.isArray(userIds) || userIds.length === 0) {
            throw new Error("Missing or invalid required fields for creating notification");
        }
        const notificationPromises = userIds.map(async (userId) => {
            if (!userId) {
                return;
            }
             const updatedUser=await User.findById(userId).lean();
            if (!updatedUser) {
                console.warn(`User with ID ${userId} not found`);
                return;
            }

            await Notification.create({ title, message, userIds:[userId] });
        });

        await Promise.all(notificationPromises); 

        return { success: true, message: "Notifications created successfully" };

    } catch (error) {
        console.error("Error sending notifications:", error);
        return {
            success: false,
            message: "Server error in sending notification",
            error: error.message
        };
    }
};

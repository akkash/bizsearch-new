import { NotificationService, NotificationType } from './notification-service';

/**
 * Utility to create test notifications for demonstration
 */
export class NotificationTestUtils {
  /**
   * Create sample notifications for testing
   */
  static async createTestNotifications(userId: string) {
    const testNotifications: Array<{
      type: NotificationType;
      title: string;
      message: string;
      actionUrl?: string;
    }> = [
      {
        type: 'new_inquiry',
        title: 'New Inquiry Received',
        message: 'You have received a new inquiry about your "Premium Restaurant Business" listing.',
        actionUrl: '/inquiries',
      },
      {
        type: 'listing_approved',
        title: 'Listing Approved',
        message: 'Your business listing "Cafe Chain" has been approved and is now live!',
        actionUrl: '/businesses',
      },
      {
        type: 'verification_approved',
        title: 'Verification Complete',
        message: 'Your account verification has been completed successfully.',
      },
      {
        type: 'saved_listing_update',
        title: 'Price Drop Alert',
        message: 'A business you saved has reduced its price by 15%.',
        actionUrl: '/saved',
      },
      {
        type: 'inquiry_response',
        title: 'Inquiry Response',
        message: 'The seller has responded to your inquiry about "Tech Startup".',
        actionUrl: '/inquiries',
      },
      {
        type: 'system',
        title: 'Welcome to BizSearch',
        message: 'Thank you for joining BizSearch! Complete your profile to get started.',
        actionUrl: '/profile/edit',
      },
    ];

    try {
      for (const notif of testNotifications) {
        await NotificationService.createNotification(
          userId,
          notif.type,
          notif.title,
          notif.message,
          notif.actionUrl
        );
      }
      console.log('✅ Test notifications created successfully');
    } catch (error) {
      console.error('❌ Error creating test notifications:', error);
    }
  }

  /**
   * Create a single test notification
   */
  static async createSingleTestNotification(userId: string) {
    try {
      await NotificationService.createNotification(
        userId,
        'system',
        'Test Notification',
        'This is a test notification created at ' + new Date().toLocaleTimeString(),
        '/notifications'
      );
      console.log('✅ Test notification created');
    } catch (error) {
      console.error('❌ Error creating test notification:', error);
    }
  }
}

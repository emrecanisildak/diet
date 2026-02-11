import os
import logging
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from simple_apns import APNSClient, Payload

from app.models.notification import Notification
from app.models.user import User

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.team_id = os.getenv("APNS_TEAM_ID")
        self.key_id = os.getenv("APNS_KEY_ID")
        self.bundle_id = os.getenv("APNS_BUNDLE_ID", "com.dietapp.client")
        self.auth_key_path = os.getenv("APNS_AUTH_KEY_PATH", "cert/apns_key.p8")
        self.use_sandbox = os.getenv("APNS_USE_SANDBOX", "true").lower() == "true"
        
        self.client = None
        if all([self.team_id, self.key_id, os.path.exists(self.auth_key_path)]):
            try:
                self.client = APNSClient(
                    team_id=self.team_id,
                    auth_key_id=self.key_id,
                    auth_key_path=self.auth_key_path,
                    bundle_id=self.bundle_id,
                    use_sandbox=self.use_sandbox
                )
            except Exception as e:
                logger.error(f"Failed to initialize APNs client: {e}")
        else:
            logger.warning("APNs credentials missing or .p8 file not found. Running in MOCK mode.")

    def send_push_notification(self, db: Session, user: User, title: str, content: str):
        # 1. Save to Database
        notification = Notification(
            user_id=user.id,
            title=title,
            content=content,
            created_at=datetime.utcnow()
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)

        # 2. Send Push if token exists
        if user.apns_token:
            if self.client:
                try:
                    payload = Payload(alert_title=title, alert_body=content)
                    self.client.send_notification(user.apns_token, payload)
                    logger.info(f"Push notification sent to user {user.id} ({user.full_name})")
                except Exception as e:
                    logger.error(f"Failed to send push notification to user {user.id}: {e}")
            else:
                logger.info(f"[MOCK PUSH] To: {user.full_name}, Title: {title}, Content: {content}")
        
        return notification

    def send_bulk_push(self, db: Session, title: str, content: str):
        # Send to all client users (save to DB + push if token exists)
        users = db.query(User).filter(User.role == "client").all()
        results = []
        for user in users:
            notif = self.send_push_notification(db, user, title, content)
            results.append(notif)
        return results

notification_service = NotificationService()

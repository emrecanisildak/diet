import logging
from datetime import datetime, date
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.notification import ScheduledNotification
from app.services.notification_service import notification_service

logger = logging.getLogger(__name__)

class NotificationScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.is_running = False

    def start(self):
        if not self.is_running:
            self.scheduler.add_job(
                self.process_scheduled_notifications,
                "interval",
                minutes=1,
                id="process_scheduled",
                replace_existing=True
            )

            self.scheduler.start()
            self.is_running = True
            logger.info("Notification scheduler started.")

    def shutdown(self):
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("Notification scheduler shut down.")

    def process_scheduled_notifications(self):
        db = SessionLocal()
        try:
            now = datetime.utcnow()

            active_items = db.query(ScheduledNotification).filter(
                ScheduledNotification.is_active == True
            ).all()

            for item in active_items:
                if item.schedule_type == "once":
                    scheduled_dt = datetime.fromisoformat(item.scheduled_time)
                    if scheduled_dt <= now:
                        logger.info(f"Sending one-time notification: {item.title}")
                        notification_service.send_bulk_push(db, item.title, item.content)
                        item.is_active = False
                        item.last_sent_at = now
                        db.commit()

                elif item.schedule_type == "daily":
                    # scheduled_time is "HH:MM" format
                    try:
                        hour, minute = map(int, item.scheduled_time.split(":"))
                    except (ValueError, AttributeError):
                        logger.error(f"Invalid daily time format for notification {item.id}: {item.scheduled_time}")
                        continue

                    today = date.today()
                    scheduled_today = datetime(today.year, today.month, today.day, hour, minute)

                    if now >= scheduled_today:
                        already_sent_today = (
                            item.last_sent_at is not None
                            and item.last_sent_at.date() == today
                        )
                        if not already_sent_today:
                            logger.info(f"Sending daily notification: {item.title}")
                            notification_service.send_bulk_push(db, item.title, item.content)
                            item.last_sent_at = now
                            db.commit()

        except Exception as e:
            logger.error(f"Error processing scheduled notifications: {e}")
        finally:
            db.close()

notification_scheduler = NotificationScheduler()

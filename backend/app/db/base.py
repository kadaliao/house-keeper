# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base  # noqa
from app.models.user import User  # noqa
from app.models.item import Item  # noqa
from app.models.location import Location  # noqa
from app.models.reminder import Reminder  # noqa 
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0020_remove_is_public_add_field_attachments_and_duplicated_from"),
    ]

    operations = [
        migrations.RunSQL(
            "CREATE EXTENSION IF NOT EXISTS unaccent;",
            reverse_sql="DROP EXTENSION IF EXISTS unaccent;",
        ),
    ]

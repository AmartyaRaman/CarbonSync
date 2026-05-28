from django.db import migrations
from django.contrib.auth.hashers import make_password

def seed_data(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    User = apps.get_model('auth', 'User')
    
    admin_group, _ = Group.objects.get_or_create(name='Admin')
    analyst_group, _ = Group.objects.get_or_create(name='Analyst')
    viewer_group, _ = Group.objects.get_or_create(name='Viewer')
    
    # Admin User
    if not User.objects.filter(username='admin').exists():
        admin_user = User.objects.create(
            username='admin',
            email='admin@example.com',
            password=make_password('admin123'),
            is_superuser=True,
            is_staff=True
        )
        admin_user.groups.add(admin_group)
        
    # Analyst User
    if not User.objects.filter(username='analyst').exists():
        analyst_user = User.objects.create(
            username='analyst',
            email='analyst@example.com',
            password=make_password('analyst123'),
            is_superuser=False,
            is_staff=False
        )
        analyst_user.groups.add(analyst_group)
        
    # Viewer User
    if not User.objects.filter(username='viewer').exists():
        viewer_user = User.objects.create(
            username='viewer',
            email='viewer@example.com',
            password=make_password('viewer123'),
            is_superuser=False,
            is_staff=False
        )
        viewer_user.groups.add(viewer_group)

def remove_seeded_data(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    User = apps.get_model('auth', 'User')
    
    User.objects.filter(username__in=['admin', 'analyst', 'viewer']).delete()
    Group.objects.filter(name__in=['Admin', 'Analyst', 'Viewer']).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('emissions', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_data, remove_seeded_data),
    ]

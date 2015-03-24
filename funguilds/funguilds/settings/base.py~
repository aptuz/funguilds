"""
Django settings for funguilds project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
from unipath import Path
PROJECT_ROOT = Path(__file__).ancestor(3)
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
"""import djcelery

djcelery.setup_loader()
"""
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.7/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '6(uj7uemldt_ine#jn^rs2h2&r*u5z%@fv#&ad%@h=@2fu#z*b'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

TEMPLATE_DEBUG = False

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'django_user_agents',
    'core.authentication', 
    'core.services',
    'core.games',
    'ws4redis',
)

ACTIVE_TIME_DELTA = 60

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django_user_agents.middleware.UserAgentMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'core.authentication.auth_middleware.LoginRequiredMiddleware',
    'core.authentication.auth_middleware.ActiveMiddleware',
)

ROOT_URLCONF = 'funguilds.urls'

WSGI_APPLICATION = 'funguilds.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
#     }
# }

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/

STATIC_URL = '/static/'

##Custom configuration
STATICFILES_DIRS = (
    PROJECT_ROOT.child('assets'),
)

TEMPLATE_DIRS = (
    PROJECT_ROOT.child('templates'),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)


#Custom user model
AUTH_USER_MODEL = 'authentication.Users'


#Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'funguilds',                      # Or path to database file if using sqlite3.
        # The following settings are not used with sqlite3:
        'USER': 'guild',
        'PASSWORD': 'guild',
        'HOST': 'localhost',                      # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
        'PORT': '5432',                      # Set to empty string for default.
        'ATOMIC_REQUESTS': True,    #to wrap http request/response cycle into a transaction
    }
}

##Rest framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
        #'rest_framework.permissions.IsAuthenticated',
    ),
    # 'DEFAULT_RENDERER_CLASSES': (
    #     'rest_framework.renderers.JSONRenderer',
    # ),
    # 'DEFAULT_PARSER_CLASSES': (
    #     'rest_framework.parsers.JSONParser',
    # ),
    'DEFAULT_FILTER_BACKENDS': (
        'funguilds.restful.filters.CustomFilterBackend',
    ),
    # 'EXCEPTION_HANDLER': 'funguilds.restful.exceptions.custom_exception_handler',
    # 'PAGINATE_BY': 10,
}

#Email configuration

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

EMAIL_HOST_USER = 'partha@aptuz.com'
EMAIL_HOST_PASSWORD = '****'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = '587'
EMAIL_USE_TLS = True

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.static',
    'ws4redis.context_processors.default',
)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

#### Celery Settings ####

#BROKER_URL = 'redis://localhost:6379/0'
BROKER_URL = 'amqp://guest:guest@localhost:5672/default'
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_RESULT_BACKEND = 'db+sqlite:///celery_results.db'
CELERY_TIMEZONE = 'UTC'

#### Caches ####

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

#### Websocket Settings ####

WEBSOCKET_URL = '/ws/'
WS4REDIS_EXPIRE = 60
WSGI_APPLICATION = 'ws4redis.django_runserver.application'
SESSION_ENGINE = 'redis_sessions.session'
SESSION_REDIS_PREFIX = 'session'
WS4REDIS_EXPIRE = 10
WS4REDIS_PREFIX = 'ws'
WS4REDIS_HEARTBEAT = '--heartbeat--'

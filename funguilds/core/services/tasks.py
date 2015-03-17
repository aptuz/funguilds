from django.template import Context
from django.template.loader import get_template
from django.core.mail import EmailMessage
from django.conf import settings
# from celery import shared_task
from funguilds import celery_app as app
from celery.contrib import rdb
          

@app.task
def sendMail(*args, **kwargs):
    """ sending Mail """
    from_email = "partha@aptuz.com"
    email_list = kwargs['to_list']
    subject = kwargs['subject']
    template = kwargs['template']   
    if 'context' in kwargs:
        context = kwargs['context'] 
    else:
        context = {}
    message = get_template('email_templates/' + template).render(Context(context))
    msg = EmailMessage(subject, message, to = email_list, from_email = from_email)
    msg.content_subtype = 'html'
    if "file_name" in kwargs:
        file_name = kwargs['attachment']
        msg.attach_file(file_name)
    msg.send()
    return True

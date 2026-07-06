
from django.contrib import admin
from .models import Member, Savings, Loan, Repayment

admin.site.register(Member)
admin.site.register(Savings)
admin.site.register(Loan)
admin.site.register(Repayment)

# Register your models here.


from django.db import models


class Member(models.Model):
    full_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=10)
    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    address = models.CharField(max_length=255)
    national_id = models.CharField(max_length=30, unique=True)
    registration_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.full_name


class Savings(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.member.full_name} - {self.amount}"


class Loan(models.Model):
    STATUS = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    duration = models.IntegerField(help_text="Loan duration in months")
    application_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS, default='Pending')

    def __str__(self):
        return f"{self.member.full_name} - {self.amount}"


class Repayment(models.Model):
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.loan.member.full_name} - {self.amount_paid}"

# Create your models here.

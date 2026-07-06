from django.shortcuts import render, redirect, get_list_or_404, get_object_or_404
from .models import Member, Savings, Loan, Repayment
from .forms import MemberForm

def dashboard(request):
    members = Member.objects.count()
    savings = Savings.objects.count()
    loans = Loan.objects.count()
    repayments = Repayment.objects.count()

    context = {
        'members': members,
        'savings': savings,
        'loans': loans,
        'repayments': repayments,
    }

    return render(request, 'dashboard.html', context)

def member_list(request):
    members = Member.objects.all()
    return render(request, 'members/list.html', {'members': members})


def add_member(request):
    if request.method == 'POST':
        form = MemberForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('member_list')
    else:
        form = MemberForm()

    return render(request, 'members/add.html', {'form': form})


def edit_member(request, id):
    member = get_object_or_404(Member, id=id)

    if request.method == 'POST':
        form = MemberForm(request.POST, instance=member)
        if form.is_valid():
            form.save()
            return redirect('member_list')
    else:
        form = MemberForm(instance=member)

    return render(request, 'members/edit.html', {'form': form})


def delete_member(request, id):
    member = get_object_or_404(Member, id=id)
    member.delete()
    return redirect('member_list')

# Create your views here.

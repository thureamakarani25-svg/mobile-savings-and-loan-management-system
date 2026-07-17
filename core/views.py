from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_list_or_404, get_object_or_404
from .models import Member, Savings, Loan, Repayment
from .forms import MemberForm


def home_view(request):
    if not request.user.is_authenticated:
        return redirect('login')

    if request.user.is_staff or request.user.is_superuser:
        return redirect('admin_dashboard')

    return redirect('member_dashboard')


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            if user.is_staff or user.is_superuser:
                return redirect('admin_dashboard')
            return redirect('member_dashboard')

        return render(request, 'login.html', {'error': 'Invalid username or password.'})

    return render(request, 'login.html')


@login_required
def logout_view(request):
    logout(request)
    return redirect('login')


@login_required
def admin_dashboard_view(request):
    if not (request.user.is_staff or request.user.is_superuser):
        return redirect('member_dashboard')

    members = Member.objects.count()
    savings = Savings.objects.count()
    loans = Loan.objects.count()
    repayments = Repayment.objects.count()

    context = {
        'members': members,
        'savings': savings,
        'loans': loans,
        'repayments': repayments,
        'user': request.user,
    }

    return render(request, 'dashboard.html', context)


@login_required
def member_dashboard_view(request):
    if request.user.is_staff or request.user.is_superuser:
        return redirect('admin_dashboard')

    return render(request, 'member_dashboard.html', {'user': request.user})


def dashboard(request):
    return redirect('admin_dashboard')


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

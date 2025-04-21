import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router} from '@angular/router';
import { User } from '../user-module/users/userModel';
import { MenuItem } from '../todo-Module/todo/menuItems.model';
import { filter, Observable, Subscription } from 'rxjs';
import { imageUrl } from '../../constant/imageUrl';
import { AuthService } from '../../Services/auth/auth.service';
import { ToastService } from '../../Services/utility/toast.service';

@Component({
  selector: 'app-home',
  standalone:false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',

})
export class HomeComponent implements OnInit,OnDestroy{
  loggedInuser$:Observable<User | null>=new Observable();
  currentUser:User | null=null;
  menuItems: MenuItem[]=[];
  labels:any[]=[]
  items:any[]=[]
  imageUrl:string=imageUrl;
  userSubscription:Subscription | null=null;
  routerSubscription:Subscription | null=null;
  ngOnInit() {
    this.loggedInuser$=this.authSrvc.currentUser$;
     
    this.userSubscription= this.loggedInuser$.subscribe(user=>{
      this.currentUser=user
      this.setUser(user)
    })
    this.setupMenuItems(this.router.url);
    this.routerSubscription= this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setupMenuItems(event.urlAfterRedirects);
      });
  }
  ngOnDestroy(): void {
      if (this.userSubscription) {
        this.userSubscription.unsubscribe();
      }
      if (this.routerSubscription) {
        this.routerSubscription.unsubscribe()
      }
  }
  router=inject(Router)

  setupMenuItems(currentRoute: string) {
    const items = [];
  
    if (!currentRoute.includes('/home/user')) {
      items.push({
        label: 'View Profile',
        icon: 'person',
        action: () => this.viewProfile()
      });
    }
  
    items.push({
      label: 'Logout',
      icon: 'logout',
      action: () => this.logout()
    });
  
    this.menuItems = items;
  }
  constructor(private authSrvc:AuthService,private toast:ToastService){
  }
  viewProfile(){
    this.router.navigateByUrl('/home/user');
  }
  logout(){
    this.authSrvc.logout()
  }
  setUser(user:User | null){
    if (user?.role==='admin') {
      this.items = [
        { label: 'User List', icon: 'pi pi-cog',routerLink:'admin-page'},
        {label:'Todo Page',icon:'pi pi-cog',routerLink:'todo' }
      ];
    }else if(user){
      this.items = [
        {label:'Todo Page',icon:'pi pi-cog' , routerLink:'todo'}
      ];
    }
    else{
      // user is null logout
       this.items=[];
    }
  }
  onProfileOpen(event:Event,menu:any){
      menu.toggle(event);
  }
  viewNotifications(e:boolean){

  }
}

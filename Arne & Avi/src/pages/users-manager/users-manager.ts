import { Component } from "@angular/core";
import { IonicPage, NavController, ModalController, ViewController, NavParams } from "ionic-angular";
import { UserProvider } from "./../../providers/user/user";

@IonicPage()
@Component({
  selector: 'page-users-manager',
  templateUrl: 'users-manager.html',
})
export class UsersManagerPage {
  curUser: any = {};
  public users;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public viewCtrl: ViewController,
    public userProv: UserProvider,
    public navParams: NavParams
  ) { 
    this.curUser = navParams.get('curUser');
  }

  ionViewDidEnter() {
    if(this.curUser){
      
      this.userProv
        .read()
        .then(users => {
          this.users = users;
        })
        .catch(err => {
          console.log(err);
        });
    }else{
      this.navCtrl.setRoot('HomePage', {curUser: this.curUser});
    }
  }

  showCurUser(){
    if(this.curUser != undefined){
      console.log(this.curUser);
      let modal = this.modalCtrl.create("UserPage", { user: this.curUser, curUser:this.curUser });
      modal.onDidDismiss(data => {
        this.reReadUsers();
      });
      modal.present();
    }
    else{
      console.log(this.curUser);
    }
  }

  showDetails(user) {
    console.log(user);
    let modal = this.modalCtrl.create("UserPage", { user: user, curUser:this.curUser });
    modal.onDidDismiss(data => {
      this.reReadUsers();
    });
    modal.present();
  }

  getPic(user){
    return this.userProv.getPic(user);
  }

  goHome(){
    this.navCtrl.setRoot('HomePage', {curUser: this.curUser});
  }
  
  goMyLikers(){
    this.navCtrl.setRoot('MyLikersPage', {curUser: this.curUser});
  }
  
  goMyMatches(){
    this.navCtrl.setRoot('MyMatchesPage', {curUser: this.curUser});
  }

  addUser() {
    let modal = this.modalCtrl.create("UserPage", { user: null, curUser: this.curUser });
    modal.onDidDismiss(data => {
      this.reReadUsers();
    });
    modal.present();
  }

  reReadUsers() {
    this.userProv
      .read()
      .then(users => {
        this.users = users;
        this.curUser = users[users.findIndex(item=>{return item.id == this.curUser.id})];
      })
      .catch(err => {
        console.log(err);
      });
  }
}

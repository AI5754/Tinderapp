import { Component } from "@angular/core";
import { IonicPage, NavController, ModalController, ViewController, NavParams } from "ionic-angular";
import { UserProvider } from "./../../providers/user/user";

@IonicPage()
@Component({
  selector: 'page-my-matches',
  templateUrl: 'my-matches.html',
})
export class MyMatchesPage {
  curUser: any = {};
  public matches = [];
  users;

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
      this.matches = this.curUser.doc.matches;
      
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
    else{
      this.navCtrl.setRoot('HomePage', {curUser: this.curUser});
    }
  }
  
  ionViewDidLeave(){
    if(this.users){
      console.log("Exit");
      this.userProv.read()
        .then(users => {
          for (let ind = 0; ind < users.length; ind++) {
            this.users[ind].doc._rev = users[ind].doc._rev;
            this.userProv.update(this.users[ind].doc);    
          }
        })
        .catch(err => {
          console.log(err);
        });
      console.log(this.curUser);
    }
  }
  
  getFirstName(user){
    if(this.users){
      return this.users[this.users.findIndex(item => {return item.id == user})].doc.firstName;
    }
  }

  getLastName(user){
    if(this.users){
      return this.users[this.users.findIndex(item => {return item.id == user})].doc.lastName;
    }
  }

  getPic(user){
    if(this.users){
      return this.userProv.getPic(user);
    }
  }

  goHome(){
    this.navCtrl.setRoot('HomePage', {curUser: this.curUser});
  }
  
  goMyLikers(){
    this.navCtrl.setRoot('MyLikersPage', {curUser: this.curUser});
  }

  goUsersManager(){
    this.navCtrl.setRoot('UsersManagerPage', {curUser: this.curUser});
  }

  showCurUser(){
    if(this.curUser != undefined){
      console.log(this.curUser);
      let modal = this.modalCtrl.create("UserPage", { user: this.curUser, curUser: this.curUser });
      modal.onDidDismiss(data => {
        if(data){
          this.curUser.doc = data;
        }
      });
      modal.present();
    }
    else{
      console.log(this.curUser);
    }
  }

  goChat(matcherId){
    if(this.users){
      let matcher = this.users[this.users.findIndex(item => {return item.id == matcherId})];
      console.log("you can now chat with " + matcher.doc.firstName + " " + matcher.doc.lastName);
      let modal = this.modalCtrl.create("ChatPage", {curUser: this.curUser, matcher: matcher});
      modal.present();  
    }
  }
}

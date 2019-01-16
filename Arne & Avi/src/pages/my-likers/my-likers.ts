import { Component } from "@angular/core";
import { IonicPage, NavController, ModalController, ViewController, NavParams } from "ionic-angular";
import { UserProvider } from "./../../providers/user/user";
import { cursorTo } from "readline";

@IonicPage()
@Component({
  selector: 'page-my-likers',
  templateUrl: 'my-likers.html',
})
export class MyLikersPage {
  curUser: any = {};
  public likers;
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
      this.likers = this.curUser.doc.likers;
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
      console.log(this.users);
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
  
  goMyMatches(){
    this.navCtrl.setRoot('MyMatchesPage', {curUser: this.curUser});
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
  
  swiped(event, user) {
    user = this.users[this.users.findIndex(item => {return item.id == user})];
    
    //swipe left = dislike
    if (event.direction === 2){
      this.removeUserFromUsersToShowList(this.curUser, user.id);
      this.removeUserFromLikersList(this.curUser, user.id);
    }

    //swipe right = like
    else if (event.direction === 4){
      user.doc.matches.push(this.curUser.id);
      this.curUser.doc.matches.push(user.id);
      this.removeUserFromLikersList(this.curUser, user.id);
      this.removeUserFromUsersToShowList(this.curUser, user.id);

      //like here is always a match
      let modal = this.modalCtrl.create("MatchMessagePage", { matcher: user, curUser: this.curUser });
      modal.present();
    }
  }

  removeUserFromLikersList(user, userIdToRemove){
    let indToRem = user.doc.likers.findIndex(item => {return item==userIdToRemove});
    if(indToRem >= 0){
      user.doc.likers.splice(indToRem, 1);
    }
    if(user.id == this.curUser.id){
      this.likers = this.curUser.doc.likers;
    }
  }

  //removes id of userIdToRemove from usersToShow list of user
  removeUserFromUsersToShowList(user, userIdToRemove){   
    let indToRem = user.doc.usersToShow.findIndex(item => {return item==userIdToRemove});
    if(indToRem >= 0){    
      user.doc.usersToShow.splice(indToRem, 1);
    }
  }
}

import { Component } from "@angular/core";
import { IonicPage, NavController, ModalController, ViewController, NavParams } from "ionic-angular";
import { UserProvider } from "./../../providers/user/user";

@IonicPage()
@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  curUser: any = {};
  public users;
  usersToShow;

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
    this.userProv.createPouchDB();

    // redirect to LoginPage
    if(this.curUser === undefined){
      let modal = this.modalCtrl.create("LoginPage", { curUser: this.curUser });
      modal.onDidDismiss(data => {
        //check if inserted user in loginpage
        this.curUser = data;
        if(this.curUser){
          this.reReadUsers();
        }
        else{
          modal.present();
        }
      });
      modal.present();
    } else{
      this.reReadUsers();   
    }
  }

  ionViewDidLeave(){
    console.log("Exit homepage");
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

  getFirstName(user){
    if(user){
      return this.users[this.users.findIndex(item => {return item.id == user})].doc.firstName;
    }
  }

  getLastName(user){
    if(user){
      return this.users[this.users.findIndex(item => {return item.id == user})].doc.lastName;
    }
  }

  getPic(user){
    if(user){
      return this.userProv.getPic(user);
    }
  }

  goMyLikers(){
    this.navCtrl.setRoot('MyLikersPage', {curUser: this.curUser});
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
      this.removeUserFromUsersToShowList(user, this.curUser.id);
    }
    //swipe right = like
    else if (event.direction === 4){
      user.doc.likers.push(this.curUser.doc._id);
      this.removeUserFromUsersToShowList(this.curUser, user.id);

      if(this.isMatch(user)){
        user.doc.matches.push(this.curUser.id);
        this.curUser.doc.matches.push(user.id);
        this.curUser = this.removeUserFromLikersList(this.curUser, user.id);
        user = this.removeUserFromLikersList(user, this.curUser.id);
        
        let modal = this.modalCtrl.create("MatchMessagePage", { matcher: user, curUser: this.curUser });
        modal.present();
      }
    }
  }

  removeUserFromLikersList(user, userIdToRemove){
    let indToRem = user.doc.likers.findIndex(item => {return item==userIdToRemove});
    if(indToRem >= 0){
      user.doc.likers.splice(indToRem, 1);
    }
  }

  //removes id of userIdToRemove from usersToShow list of user
  removeUserFromUsersToShowList(user, userIdToRemove){   
    let indToRem = user.doc.usersToShow.findIndex(item => {return item==userIdToRemove});
    if(indToRem >= 0){    
      user.doc.usersToShow.splice(indToRem, 1);
      console.log("hi1");
      if(user.id == this.curUser.id){
        console.log("hi2");
        this.usersToShow = this.curUser.doc.usersToShow;
      }
    }
  }

  isMatch(user2){
    if(this.curUser && user2){
      if(this.curUser.doc.likers.findIndex(item=>{return item == user2.id}) >= 0){
        return true;
      }
    }
    return false;
  }

  reReadUsers() {
    this.userProv
      .read()
      .then(users => {
        this.users = users;
        this.usersToShow = this.curUser.doc.usersToShow;
        this.curUser = users[users.findIndex(item=>{return item.id == this.curUser.id})];
      })
      .catch(err => {
        console.log(err);
      });
  }
}

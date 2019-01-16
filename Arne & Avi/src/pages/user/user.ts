import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, ViewController, AlertController } from "ionic-angular";
import { UserProvider } from "./../../providers/user/user";
import { ImageProvider } from "./../../providers/image/image";


@IonicPage()
@Component({
  selector: "page-user",
  templateUrl: "user.html"
})
export class UserPage {
  user: any = {};
  canDelete = false;
  canUpdate = false;
  curUser;
  oldPreferredGender;
  oldGender;
  hasPic = false;
  showErrorMessage = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userProvider: UserProvider,
    public viewCtrl: ViewController,
    public imgProv: ImageProvider,
    private alertCtrl: AlertController
  ) { }

  ionViewDidEnter() {
    this.curUser = this.navParams.get("curUser");
    var user = this.navParams.get("user");
      
    if(this.curUser){
      if (user) {
        this.user = user.doc;
        this.canDelete = true;
        this.canUpdate = true;
        this.oldGender = user.doc.gender;
        this.oldPreferredGender = user.doc.preferredGender;
      }
      this.checkAndShowAddUpdateButton();
    } else{
      this.user = user;
    }
  }

  addOrUpdate() {
    if(this.user.firstName === undefined || this.user.lastName === undefined || this.user.firstName == "" || this.user.lastName == ""
     || this.user.gender === undefined || this.user.preferredGender === undefined){
      this.showErrorMessage = true;
    } else {
      if (this.canUpdate) {
        if(this.user.gender != this.oldGender || this.user.preferredGender != this.oldPreferredGender){
          this.presentConfirm();
        } else {
          this.userProvider.update(this.user).catch(() => { });
          this.viewCtrl.dismiss(this.user);
        }
      } else {
        this.user.likers = [];
        this.user.usersToShow = [];
        this.user.matches = [];
        console.log("thats ok");
        this.userProvider.create(this.user).then( this.userProvider.read().then(users => {
          let newAddedUserInd;
            
          //find index of new user
          for(let ind = 0 ; ind < users.length; ind++ ){
            console.log(users);
            if(newAddedUserInd === undefined){
              if(users[ind].doc.firstName == this.user.firstName && users[ind].doc.lastName == this.user.lastName){
                newAddedUserInd = ind;
              }
            }
          }
      
          //add new user to list of userstoshow of other users and other users to list of new user
          for(let ind = 0; ind < users.length; ind++){
            if(ind != newAddedUserInd){
              if((users[ind].doc.gender == users[newAddedUserInd].doc.preferredGender || users[newAddedUserInd].doc.preferredGender == "all")
               && (users[ind].doc.preferredGender == users[newAddedUserInd].doc.gender || users[ind].doc.preferredGender == "all")){
                users[ind].doc.usersToShow.push(users[newAddedUserInd].id);
                users[newAddedUserInd].doc.usersToShow.push(users[ind].id);
                this.userProvider.update(users[ind].doc);
              }
            }
          }
          this.userProvider.update(users[newAddedUserInd].doc);
        })).catch(err => {
          console.log(err);
        }); 

        this.viewCtrl.dismiss(this.user);  
      }
    }
  }

  presentConfirm() {
    let alert = this.alertCtrl.create({
      title: 'Error',
      message: "Gender and preferred gender are unchangeable",
      buttons: [
        {
          text: 'OK',
          role: 'ok',
          handler: () => {
            this.user.gender = this.oldGender;
            this.user.preferredGender = this.oldPreferredGender;
          }
        }
      ]
    });
    alert.present();
  }
  

  delete() {
    //removes first his account, than his id's from other accounts
    let isCurUser = this.curUser.id == this.user._id;
    
    this.userProvider.delete(this.user).then(
    this.userProvider.read().then(users => {      
      for(let user of users){
        if(user.id != this.user._id){
          let indToRemove = user.doc.likers.findIndex(item=>{return item == this.user._id});
          if(indToRemove >= 0){
            user.doc.likers.splice(indToRemove, 1);
          }
          indToRemove = user.doc.usersToShow.findIndex(item=>{return item == this.user._id});
          if(indToRemove >= 0){
            user.doc.usersToShow.splice(indToRemove, 1);
          }
          this.userProvider.update(user.doc);
        }
      }
    }).catch(err => {
        console.log(err);
    })).catch(err => { 
      console.log(err)
    });

    if(isCurUser){
      this.navCtrl.setRoot('HomePage');
    } else{
      this.viewCtrl.dismiss(this.user);
    }
  }

  checkAndShowAddUpdateButton(){
    this.hasPic = this.user._attachments;
  }

  getPic(){
    return this.userProvider.getPic(this.user._id);
  }

  takePhoto() {
    this.imgProv
      .takePhotograph()
      .then(image => {
        this.user._attachments = {
          "pic.png": {
            content_type: "image/png",
            data: image.toString()
          }
        };
        this.userProvider.update(this.user).catch(() => { });
        this.checkAndShowAddUpdateButton();
      })
      .catch(err => {
        console.log(err);
      });
  }
}

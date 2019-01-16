import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { ImageProvider } from "./../../providers/image/image";

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  curUser: any = {};
  foundUser: any = {};

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userProvider: UserProvider,
    public imgProv: ImageProvider,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController
  ) { }

  ionViewDidLoad() {}
  
  goRegister(){
    console.log(this.curUser);
    let modal = this.modalCtrl.create("UserPage", { user: this.curUser });
    modal.onDidDismiss(data => {
      this.curUser = data;
      this.checkLogin();
    });
    modal.present();
  }

  checkLogin() {
    if (this.curUser) {
      this.findUser(this.curUser).then(() => {      
        if(this.foundUser.id != undefined){
          this.viewCtrl.dismiss(this.foundUser);
        }
        else{
          this.goRegister();
        }
      });
    }
    else{
      location.reload();
    }
  }
  
  //searches a user by first and last name.
  findUser(user) {
    if(user){
    return this.userProvider
      .read()
      .then(users => {
        for(var ind=0; ind<users.length; ind ++){
          var u=users[ind];
          if(u.doc.firstName == user.firstName && user.lastName == u.doc.lastName)
          {
            this.foundUser = users[ind];
          }
        };
      })
      .catch(err => {
        console.log(err);
      });
    }
    return this.foundUser;
  }

  takePhoto() {
    this.imgProv
      .takePhotograph()
      .then(image => {
        this.curUser._attachments = {
          "pic.png": {
            content_type: "image/png",
            data: image.toString()
          }
        };
        this.userProvider.update(this.curUser).catch(() => { });
        console.log(this.curUser);
      })
      .catch(err => {
        console.log(err);
      });
  }
}

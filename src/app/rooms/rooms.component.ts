import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase} from '@angular/fire/compat/database';
import { Router } from '@angular/router';
import { Observable, Subject } from "rxjs";
import { map, take, takeUntil } from 'rxjs/operators';

export interface Iroom{
  key?: string;
  name?: string;
  host?: string;
}

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit, OnDestroy {

  public $rooms : Observable<Iroom> | undefined | any;
  public isRoomCreationShown = false;
  private user :string | undefined;
  private roomList = this.db.list<Iroom>('rooms');
  private $destroy: Subject<boolean> = new Subject<boolean>();


  constructor(
    private auth : AngularFireAuth,
    private route : Router,
    private db : AngularFireDatabase
  ) { }

  ngOnInit(): void {
    this.$rooms = this.roomList.snapshotChanges().pipe(
      map((action)=>action.map((c)=>{
        return {
          ...(c.payload.val() as any),
          key : c.payload.key
        };
      })),
      takeUntil(this.$destroy)
    );
    this.auth.authState.pipe(take(1)).subscribe({
      next:(user)=>{
        this.user = user?.uid;
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next(true);
    this.$destroy.unsubscribe();
  }

  public addRoom(nameInput : HTMLInputElement) : void{
    if (nameInput.value.length) {
      this.roomList.push({
        name : nameInput.value,
        host : this.user
      }).then((resp )=>{
        this.navigate(resp.key);
      });
    }
    nameInput.value = '';
    this.isRoomCreationShown = false;
  }


  public navigate(roomId? : string | null) : void {
    this.route.navigate(['rooms/' + roomId])
  }


  logout(): void {
    this.auth.signOut().then(() => {
      this.route.navigate(['profile']);
    })
  }

}

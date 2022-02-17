import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as AgoraRTC from 'agora-rtc-sdk';
import * as  AgoraClient from 'agora-rtc-sdk';
import { combineLatest } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AngularFireAuth} from '@angular/fire/compat/auth';
import { AngularFireDatabase} from  '@angular/fire/compat/database';
import { Iroom } from '../rooms.component';
import { importExpr } from '@angular/compiler/src/output/output_ast';
import { take } from 'rxjs/operators';
import { PresenceService } from 'src/app/services/presence.service';

const randomNames = [
  'Alfred',
  'Tanguy',
  'Baptiste',
  'Julien',
  'Melvin'
]

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {

  private roomId? : string | null;
  private client? : AgoraRTC.Client;
  private user : any;
  public room : Iroom | null | undefined;
  public isHost = false;

  constructor(
    private activatedRoute : ActivatedRoute,
    private router : Router,
    private auth : AngularFireAuth,
    private db : AngularFireDatabase,
    private presenceService : PresenceService
  ) { }

  ngOnInit(): void {
    this.roomId = this.activatedRoute.snapshot.paramMap.get('id');
    this.initClient();
    this.joinRoom();
  }

  private joinRoom(): void {
    combineLatest([
      this.auth.authState,
      this.db.object<Iroom>(`rooms/${this.roomId}`).valueChanges()
    ]).pipe(take(1))
    .subscribe({
      next:([user, room]) =>{
        this.user = user;
        this.room = room;
        this.isHost = this.user.uid === this.room?.host;
        this.client?.setClientRole(this.isHost ? 'host' : 'audience');
        this.presenceService.setPresenceOnline({
          displayName: randomNames,
          key: this.user.uuid
        }, this.roomId).pipe(take(1)).subscribe();
      }
    })
  }

  private initClient(): void {
    this.client = AgoraRTC.createClient({
      mode : 'live',
      codec : 'vp8'
    });
    this.client.init(environment.agoraAppId);
  }

  public leaveRoom(): void {

  }

}

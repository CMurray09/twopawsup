import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {AngularFireStorage, AngularFireUploadTask} from "@angular/fire/compat/storage";
import { v4 as uuid } from 'uuid';
import {last, switchMap} from 'rxjs/operators';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import firebase from 'firebase/compat/app';
import {ClipService} from "../../services/clip.service";

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
  isDragover: boolean = false;
  file: File | null = null;
  isVideoDropped: boolean = false;
  showAlert: boolean = false;
  alertColour: string = 'blue';
  alertMsg: string = 'Please wait! Your clip is being uploaded.';
  inSubmission: boolean = false;
  percentage: number = 0;
  showPercentage: boolean = false;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;

  title = new FormControl('', {
    validators: [
      Validators.required,
      Validators.minLength(3)
    ],
    nonNullable: true
  });

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService) {
    auth.user.subscribe(user => this.user = user);
  }

  ngOnDestroy(): void {
      this.task?.cancel();
    }

  videoForm: FormGroup = new FormGroup({
    title: this.title
  })

  storeFile($event: Event) {

    this.isDragover = false;

    this.file = ($event as DragEvent).dataTransfer ?
      ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
      ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.isVideoDropped = true;
  }

  uploadFile() {
    this.videoForm.disable();
    this.showAlert = true;
    this.alertColour = 'blue';
    this.alertMsg = 'Please wait! Your clip is being uploaded.';
    this.inSubmission = true;
    this.showPercentage = true;
    const title = this.title.value;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    this.task.percentageChanges().subscribe((progress) => {
      this.percentage = progress as number / 100;
    });

    this.task.snapshotChanges().pipe(
      last(),
      switchMap(() => clipRef.getDownloadURL())
    ).subscribe({
      next: (url) => {
        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title,
          fileName: `${clipFileName}.mp4`,
          url
        }
        this.clipsService.createClip(clip);
        this.alertColour = 'green';
        this.alertMsg = 'Success! Your clip is now ready to share with the world.';
        this.showPercentage = false;
      },
      error: (error) => {
        this.videoForm.enable();
        this.alertColour = 'red';
        this.alertMsg = 'Upload failed! Please try again later.';
        this.showPercentage = false;
        this.inSubmission = true;
        console.error(error);
      }
    });
  }

}
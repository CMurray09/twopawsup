import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output} from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import IClip from "src/app/models/clip.model";
import {ClipService} from "src/app/services/clip.service";

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css']
})
export class DeleteComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null;
  @Input() clips: Array<IClip> = [];
  @Output() updateVideoList = new EventEmitter();
  inSubmission = false;
  showAlert: boolean = true;
  alertMsg: string = 'Are you sure you want to delete this video?';
  alertColour: string = 'blue';
  videoTitle: string = '';

  constructor(private modal: ModalService, private clipService: ClipService) { }

  ngOnInit(): void {
    this.modal.register('deleteClip');
  }

  ngOnDestroy(): void {
    this.modal.unregister('deleteClip');
  }

  ngOnChanges(): void {
    if (!this.activeClip) {
      return;
    }
    this.videoTitle = this.activeClip.title;
    this.showAlert = false;
  }

  deleteClip($event: Event) {
    $event.preventDefault();
    if (!this.activeClip) {
      return;
    }
    this.inSubmission = true;
    this.showAlert = true;
    try {
      this.clipService.deleteClip(this.activeClip);
    } catch (e) {
      this.inSubmission = false;
      this.alertColour = 'red';
      this.alertMsg = 'Something went wrong. Try again later';
      console.error(e);
      return;
    }
    this.updateVideoList.emit($event);
    this.inSubmission = false;
    this.alertColour = 'green';
    this.alertMsg = 'Video Deleted!';
  }
}

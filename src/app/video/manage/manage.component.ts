import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {ClipService} from "src/app/services/clip.service";
import IClip from "src/app/models/clip.model";
import {ModalService} from "src/app/services/modal.service";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  videoOrder: string = '1';
  clips: Array<IClip> = [];
  activeClip: IClip | null = null;
  sort$: BehaviorSubject<string>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modal: ModalService) {
    this.sort$ = new BehaviorSubject(this.videoOrder);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params.sort === '2' ? params.sort : '1';
      this.sort$.next(this.videoOrder);
    })

    this.clipService.getUserClips(this.sort$).subscribe(docs => {
      this.clips = [];
      docs?.forEach(doc => {
        this.clips.push({
          docID: doc.id,
          ...doc.data()
        })
      })
    });
  }

  sort(event: Event): void {
    const { value }: HTMLSelectElement = (event.target as HTMLSelectElement);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value
      }
    });
  }

  openEditModal($event: Event, clip: IClip): void {
    $event.preventDefault();
    this.activeClip = clip;
    this.modal.toggleModal('editClip');
  }

  openDeleteModal($event: Event, clip: IClip): void {
    $event.preventDefault();
    this.activeClip = clip;
    this.modal.toggleModal('deleteClip');
  }

  update($event: IClip): void {
    this.clips.forEach((element, index) => {
      if (element.docID == $event.docID) {
        this.clips[index].title = $event.title;
      }
    })
  }

  removeDeletedClip($event: Event): void {
    $event.preventDefault();
    this.clips.forEach((element, index) => {
      if (element.docID == this.activeClip!.docID) {
        this.clips.splice(index, 1);
      }
    })
  }

  async copyToClipboard($event: MouseEvent, docID: string | undefined): Promise<void> {
    $event.preventDefault();
    if (!docID) {
      return;
    }

    const url: string = `${location.origin}/clip/${docID}`;
    await navigator.clipboard.writeText(url);

    alert('Link Copied!');
  }

}

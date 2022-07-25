import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ClipService } from 'src/app/services/clip.service';
import { DatePipe } from "@angular/common";

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css'],
  providers: [DatePipe]
})
export class ClipsListComponent implements OnInit, OnDestroy {
  @Input() scrollable: boolean = true;

  constructor(public clipService: ClipService) {
    this.clipService.getClips();
  }

  ngOnInit(): void {
    if (this.scrollable) {
      window.addEventListener('scroll', this.handleScroll);
    }
  }

  ngOnDestroy(): void {
    if (this.scrollable) {
      window.removeEventListener('scroll', this.handleScroll);
    }
    this.clipService.pageClips = [];
  }

  handleScroll = (): void => {
    const {scrollTop, offsetHeight}: {scrollTop: number, offsetHeight: number} = document.documentElement;
    const { innerHeight }: Window = window;
    const bottomOfWindow: boolean = Math.round(scrollTop) + innerHeight === offsetHeight;

    if (bottomOfWindow) {
      this.clipService.getClips();
    }
  }
}

import { CdkDrag } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  NgZone,
  Optional,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

declare var jabber_resources: any;

@Component({
  selector: 'custom-libraryh3lp',
  standalone: true,
  imports: [CdkDrag, CommonModule],
  templateUrl: './libraryh3lp.component.html',
  styleUrl: './libraryh3lp.component.scss'
})
export class Libraryh3lpComponent implements OnInit {
  // Internal recordkeeping
  availabilityIntervalId?: ReturnType<typeof setInterval>;
  chatAvailability = 'unavailable';
  chatOnline = false;
  hoverTooltip = false;
  mouseDown = false;
  showChat = false;

  // Chat parameters
  queueName?: string;
  server = 'sg.libraryh3lp.com';
  snippetId?: string;

  // Optional customizations
  iconOfflineColor?: string;
  iconOnlineColor?: string;
  iconPosition?: string;
  iconSize?: string;
  showPresence = true;
  tooltipContent = '<div>Questions? Click to chat with us.</div>';

  constructor(
    private elRef: ElementRef,
    private http: HttpClient,
    @Optional() @Inject('MODULE_PARAMETERS')
    private moduleParams: Partial<Libraryh3lpComponent> | null, // type the injected params
    private zone: NgZone
  ) {
    console.log('libraryh3lp: constructor');
  }

  setParam<K extends keyof this>(key: K, value: this[K]) {
    this[key] = value;
  }

  useModuleParameter<K extends keyof this>(parameterName: K): void {
    const value = (this.moduleParams as Partial<Libraryh3lpComponent> | null)?.[
      parameterName as keyof Libraryh3lpComponent
    ];

    if (value !== undefined) {
      this.setParam(parameterName, value as this[K]);
    }
  }

  ngOnInit() {
    console.log('libraryh3lp: ngOnInit');

    // Chat basics
    this.useModuleParameter('server');
    this.useModuleParameter('queueName');
    this.useModuleParameter('snippetId');

    // Look & feel customizations
    this.useModuleParameter('iconOfflineColor');
    this.useModuleParameter('iconOnlineColor');
    this.useModuleParameter('iconPosition');
    this.useModuleParameter('iconSize');
    this.useModuleParameter('showPresence');
    this.useModuleParameter('tooltipContent');

    if (this.queueName) {
      this.checkAvailability();
      this.availabilityIntervalId = setInterval(this.checkAvailability, 5*1000);
    }

    if (this.snippetId) {
      this.loadSnippet(this.snippetId);
    }
  }

  ngOnDestroy() {
    console.log('libraryh3lp: ngOnDestroy');

    if (this.availabilityIntervalId) {
      clearInterval(this.availabilityIntervalId);
    }
  }

  checkAvailability = () => {
    const url = `https://${this.server}/presence/jid/${this.queueName}/chat.${this.server}/js`;
    this.http
      .jsonp(url, 'cb')
      .subscribe({
        next: (_) => {
          this.zone.run(() => {
            for (let idx = 0; idx < jabber_resources.length; ++idx) {
              const resource = jabber_resources[idx];
              this.chatAvailability = resource.show;
              this.chatOnline = (this.chatAvailability === 'available' || this.chatAvailability === 'chat');
            }
          });
        },
        error: (_) => {
          if (this.availabilityIntervalId) {
            clearInterval(this.availabilityIntervalId);
          }
        },
      });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = this.elRef.nativeElement.contains(event.target);
    if (!clickedInside && this.showChat && !this.chatOnline) {
      this.toggleChatTab(event);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (this.showChat && !this.chatOnline) {
      this.toggleChatTab(event);
    }
  }

  loadSnippet(id?: string): void {
    if (!id) {
      return;
    }

    const src = `https://${this.server}/js/libraryh3lp.js?${id}`;

    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  }

  mouseOverChatTab = () => {
    this.hoverTooltip = (this.chatOnline && !this.showChat) ? true : false;
    return false;
  };
  mouseOutChatTab = () => {
    this.hoverTooltip = false;
    return false;
  };

  presenceDotUrl = () => `https://${this.server}/presence/image/flat-lang-neutral/${this.chatAvailability}`

  toggleChatTab = (event: Event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    } else if (this.showChat) {
      // Clicked a toggle somewhere from page, but chat is already open.
      return false;
    }

    this.hoverTooltip = false;
    this.showChat = !this.showChat;

    return false;
  };
}

import { Component, OnInit, ViewChild, TemplateRef, Signal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CandidatesService } from '../candidates.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeUrlPipe } from '../../safe-url.pipe';
import { environment } from 'src/environments/environment';
import { LoaderComponent } from 'src/app/loader/loader.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CookieService } from 'ngx-cookie-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { EncryptedCookieService } from 'src/app/services/encrypted-cookie.service';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDateRangeInput } from '@angular/material/datepicker';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { ElementRef, viewChild, HostListener } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { HttpClient } from '@angular/common/http';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';
import { access } from 'fs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MaterialModule } from "src/app/material.module";
import { ChangeDetectorRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { CandidatedetailsService } from '../../job/candidatedetails/candidatedetails.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { RecruitmentHubService } from '../../job/RecruitmentHub/recruitment-hub.service';
import { NameCapPipe } from 'src/app/pipe/nameCap.pipe';
// import { LoaderComponent } from 'src/app/loader/loader.component';
import { CallloaderComponent } from '../../job/callloader/callloader.component';
import { myprofileService } from 'src/app/pages/MyProfile/myprofile.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CellMouseListenerFeature } from 'ag-grid-community/dist/types/src/rendering/cell/cellMouseListenerFeature';
import html2pdf from 'html2pdf.js';

type PlacementRow = {
  PlacementId: number;
  JobId: number;
  ApplicantsId: number;
  candidate_id: number;
  Org_Id: number;
  PlacementDate: string;
  ContractStartDate: string;
  ContractEndDate: string;
  JobTitle: string | null;

  ClientId: number | null;
  VendorId: number | null;
  SubVendorId: number | null;
  PartnerId: number | null;

  ClientName: string | null;
  ClientContactNo: string | null;
  ClientEmail: string | null;

  VendorName: string | null;
  VendorContactNo: string | null;
  VendorEmail: string | null;

  SubVendorName: string | null;
  SubVendorContactNo: string | null;
  SubVendorEmail: string | null;

  PartnerName: string | null;
  PartnerContactNo: string | null;
  PartnerEmail: string | null;
};
@Component({
  selector: 'app-candidate-pool',
  imports: [MatButtonModule, MatCardModule, MatChipsModule, MatIconModule, TablerIconsModule, CommonModule, SafeUrlPipe, MatProgressSpinnerModule, FormsModule, MatFormFieldModule, MatInputModule, MatDateRangeInput, MatDateRangePicker, MatNativeDateModule, MatMenuModule, MatDialogModule, MatSelectModule, MaterialModule, NameCapPipe, LoaderComponent,CallloaderComponent],
  templateUrl: './candidate-pool.component.html',
  styleUrl: './candidate-pool.component.scss',
  providers: [CandidatesService, CookieService, ToastrService,myprofileService],
  standalone: true,
  animations: [
    trigger('cardStagger', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),

    trigger('iconFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})

export class CandidatePoolComponent implements OnInit {
  @ViewChild('deletecandidateDialog') deletecandidateDialog!: TemplateRef<any>;
  private searchSubject: Subject<string> = new Subject<string>();
  private searchSub: Subscription | null = null;
  private loadingDelayTimer: any = null;
  pageIndex = 0;
  pageSize = 12;
  total = 0;
  pagedCandidates: any[] = [];
  searchText = '';
  selectedRecruiter: number | null = null;
  minExp: number | null = null;
  maxExp: number | null = null;
  location: string = '';
  selectedGroupIds: number[] = [];
  fromDate: string | null = null; // 'YYYY-MM-DD'
  toDate: string | null = null;
  // YAHAN HAI:
selectedFileName: string | null = null;
// NEECHE YEH LINE ADD KARO:
selectedFileServerPath: string = '';
  isLoading = false;
  selectedid: any;
  activeIconCandidateId: number | null = null;
  deleteModal: boolean = false;
  dialogRef!: MatDialogRef<any>;
  recruiterid: any;
  todayCandidates: any[];
  weekCandidates: any[];
  monthCandidates: any[];
  customDateCandidates: any[];
  experienceCandidates: any[] = [];
  displayingCustomDate: boolean;
  minExperience: number | null = null;
  maxExperience: number | null = null;
  displayingCustomRange: boolean;
  groupList: Group[] = [];
  name: any;
  recruiterList: { id: number; name: string }[] = [];
  recruiters: string[] = [];
  recruiterFilteredCandidates: any[] = [];
  candidateId: any;
  lastNotes: any;
  loadingCheck: boolean = false;
  isloading: boolean = false;
  showMoveModel = false;
  modelRows: PlacementRow[] = [];
  modelCandidateId?: number;
  loadingMove = false;
  selectedPlacementId?: number;
  sanitizer: any;
  showMoveModelmanual: boolean;
  benchNotes: string;

  isFilterActive(): boolean {
    return (
      this.experienceCandidates.length > 0 ||
      this.displayingToday ||
      this.displayingThisWeek ||
      this.displayingThisMonth ||
      this.displayingCustomRange
    );
  }
  ngOnInit(): void {
    this.isLoading = true;
    this.loadPage(1);
    this.reqruiterList();
    this.getGroupDetails();
    this.loadDropdowns();
    this.searchSub = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadPage(1);
      });

  }

  showDateRange = false;
  noResults: boolean = false;
  displayingToday: boolean = false;
  displayingThisWeek: boolean = false;
  displayingThisMonth: boolean = false;
  showCustomDateFilter: boolean = false;
  showExperienceFilter = false;
  accesstype: any;

  selectedDateRange: { begin: Date | null; end: Date | null } = { begin: null, end: null };
  orgid: any;
  orgdiv: any;
  useremail: any;
  integrated_mail: any;
  showModal = signal(false);
  inputValue = signal('');
  isRecruiterFilterVisible = false;
  startDate: Date | null = null;
  endDate: Date | null = null;
  candidateStatuses: Array<{ StatusID: number; StatusName: string }> = [];
  selectedCandidateStatusId: number | null = null;
  legalStatuses: Array<{ LegalStatusID: number; LegalStatusName: string }> = [];
  selectedLegalStatusId: number | null = null;
  constructor(private RecruitmentHubService: RecruitmentHubService, private candidatesService: CandidatesService, private cookie: CookieService, private toastr: ToastrService, private EncryptedCookieService: EncryptedCookieService, private router: Router, private http: HttpClient, private dialog: MatDialog, private cdr: ChangeDetectorRef, private candidatedetailsService: CandidatedetailsService,
    private route: ActivatedRoute,private myprofile:myprofileService) {
    this.orgid = this.EncryptedCookieService.getCookie('orgId');
    this.recruiterid = this.EncryptedCookieService.getCookie('userId');
    this.orgdiv = this.EncryptedCookieService.getCookie('divisionId');
    this.useremail = this.EncryptedCookieService.getCookie('email');
    this.integrated_mail = this.EncryptedCookieService.getCookie('integrated_mail');
    this.accesstype = this.EncryptedCookieService.getCookie('AccessType');
    this.recruiterFilteredCandidates = [...this.candidates];
  }
  candidates: any[] = [];
  filteredCandidates: any[] = [];
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild('experienceMenuTrigger') experienceMenuTrigger!: MatMenuTrigger;
  @ViewChild('customFilterBox', { static: false }) customFilterBox!: ElementRef;
  toggleCustomDateFilter(event: MouseEvent): void {
    event.stopPropagation();
    this.showCustomDateFilter = !this.showCustomDateFilter;
    if (this.menuTrigger) {
      this.menuTrigger.closeMenu();
    }
    this.showCustomDateFilter = true;
  }
  loadDropdowns() {
    this.candidatesService.getDropdowns().subscribe(
      (res: any) => {
        this.candidateStatuses = res?.candidateStatuses ?? [];
        this.legalStatuses = res?.legalStatuses ?? [];

      },
      err => console.error('Error loading dropdowns', err)
    );
  }



  private buildRequest(page: number, pageSize: number) {
    return {
      orgid: this.orgid,
      orgdiv: this.orgdiv,
      access: this.accesstype,
      userid: this.recruiterid,
      page,
      pageSize,
      // recriterId:this.recruiterid,
      search: this.searchText?.trim() || '',
      recruiterId: this.selectedRecruiter ?? null,
      minExp: this.minExp,
      maxExp: this.maxExp,
      location: this.location?.trim() || '',
      groupIds: this.selectedGroupIds ?? [],
      startDate: this.fromDate,
      endDate: this.toDate,
      candidateStatusId: this.selectedCandidateStatusId ?? null,
      legalStatusId: this.selectedLegalStatusId ?? null,
      source: this.selectedSource ?? null,

    };
  }
  loadPage(serverPage: number) {
    if (this.loadingDelayTimer) {
      clearTimeout(this.loadingDelayTimer);
      this.loadingDelayTimer = null;
    }
    this.loadingDelayTimer = setTimeout(() => {
      this.isLoading = true;
    }, 200);

    const req = this.buildRequest(serverPage, this.pageSize);
    this.candidatesService.getAllcandidates(req).subscribe({
      // next: (resp: any) => {
      //   if (this.loadingDelayTimer) { clearTimeout(this.loadingDelayTimer); this.loadingDelayTimer = null; }
      //   this.pagedCandidates = resp?.data ?? [];
      //   this.total = resp?.total ?? 0;
      //   this.pageIndex = Math.max(0, (resp?.page ?? serverPage) - 1);
      //   this.isLoading = false;
      // },
      next: (resp: any) => {
        if (this.loadingDelayTimer) {
          clearTimeout(this.loadingDelayTimer);
          this.loadingDelayTimer = null;
        }

        const data = resp?.data ?? [];

        this.pagedCandidates = data.map((c: any) => {
          const cid = this.toNumberId(c.candidate_id);

          let selectedGroupId: number | null = null;

          if (cid != null) {
            const matchingGroups = this.groupList.filter(g =>
              Array.isArray(g.CandidateIds) &&
              g.CandidateIds.includes(cid)
            );

            if (matchingGroups.length > 0) {
              // Take the LAST group
              const lastGroup = matchingGroups[matchingGroups.length - 1];
              selectedGroupId = lastGroup.Groupid;
            }
          }

          return {
            ...c,
            selectedGroupId
          };
        });
        this.total = resp?.total ?? 0;
        this.pageIndex = Math.max(0, (resp?.page ?? serverPage) - 1);
        this.isLoading = false;
      },

      error: () => {
        if (this.loadingDelayTimer) { clearTimeout(this.loadingDelayTimer); this.loadingDelayTimer = null; }
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
      this.searchSub = null;
    }
    if (this.loadingDelayTimer) {
      clearTimeout(this.loadingDelayTimer);
      this.loadingDelayTimer = null;
    }
  }
  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    const serverPage = event.pageIndex + 1;
    this.loadPage(serverPage);
  }
  onSearchChange(value: string) {
    this.searchText = value;
    this.searchSubject.next(value);
  }
  sourceOptions = [
    { label: 'Monster', value: 'monster' },
    { label: 'CB', value: 'CB' },           // keep exact case if your DB stores 'CB'
    { label: 'BulkUpload', value: 'BulkUpload' }
  ];
  selectedSource: string | null = null;


  onAnyFilterChanged() {
    this.pageIndex = 0;
    this.loadPage(1);
  }


  applyDateFilter(): void {
    if (!this.fromDate || !this.toDate) { alert("Select both dates"); return; }
    this.onAnyFilterChanged();
  }
  applyExperienceFilter() { this.onAnyFilterChanged(); }
  resetFilters() {
    this.searchText = '';
    this.selectedRecruiter = null;
    this.minExp = null;
    this.maxExp = null;
    this.location = '';
    this.selectedGroupIds = [];
    this.fromDate = null;
    this.toDate = null;
    this.selectedCandidateStatusId = null;   // ✅
    this.selectedLegalStatusId = null;
    this.selectedSource = null;                // ✅ NEW
    this.onAnyFilterChanged();
    this.loadPage(1);

  }

  filterByCustomDate(): void {
    console.log('Filtering from', this.fromDate, 'to', this.toDate);
    this.showCustomDateFilter = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (
      this.customFilterBox &&
      !this.customFilterBox.nativeElement.contains(event.target)
    ) {
      this.showCustomDateFilter = false;
    }
  }

  socialcards: socialcards[] = [
    {
      id: 1,
      imgSrc: '/assets/images/profile/user-1.jpg',
      username: 'Andrew Grant',
      post: 'Technology Director',
    },
    {
      id: 2,
      imgSrc: '/assets/images/profile/user-2.jpg',
      username: 'Andrew Grant',
      post: 'Technology Director',
    },
    {
      id: 3,
      imgSrc: '/assets/images/profile/user-3.jpg',
      username: 'Andrew Grant',
      post: 'Technology Director',
    },
  ];

  selectedResumeHtml: string | null = null;
  selectedResume: any

  resumeloading: boolean = false;
  seletectedemail: any;
  resumeLoadingMessages: string[] = [
    "Fetching candidate resume...",
    "Opening secure resume viewer...",
    "Scanning resume contents...",
    "Preparing formatted view...",
    "Almost ready..."
  ];
  resumeLoadingMessage: string = this.resumeLoadingMessages[0];
  resumeMessageInterval: any;
  isResumeLoading: boolean = false;

  setResumeLoadingState(loading: boolean) {
    this.isResumeLoading = loading;
    if (loading) {
      let i = 1;
      this.resumeLoadingMessage = this.resumeLoadingMessages[0];
      this.resumeMessageInterval = setInterval(() => {
        this.resumeLoadingMessage = this.resumeLoadingMessages[i % this.resumeLoadingMessages.length];
        i++;
      }, 2000);
    } else {
      clearInterval(this.resumeMessageInterval);
    }
  }
  resumefilepath: any;
  resumefilename: any;
  selectedresumeid: any

  private joinPath(path: string, file: string): string {
    const base = (path ?? '').replace(/[\/\\]+$/, '');
    const name = (file ?? '').replace(/^[\/\\]+/, '');
    return name ? `${base}/${name}` : base;
  }

private normalizeForServer(p: string): string {
  if (!p) return '';
  let s = p.replace(/\\/g, '/').trim();
  s = s.replace(/^\/+/, '');
  return s;
}
  viewerBlobUrl: string | null = null;
  // viewCandidate(candidateid: number) {
  //   this.setResumeLoadingState(true);
  //   const req = { id: candidateid };

  //   this.candidatesService.getresumefilepath(req).subscribe({
  //     next: async (x: any) => {
  //       const folder = x?.data?.resume_documents || '';
  //       const file = x?.data?.resumefile || '';

  //       // Case 1: missing path/filename from API
  //       if (!folder || (!/[\/\\][^\/\\]+\.[A-Za-z0-9]+$/.test(folder) && !file)) {
  //         this.setResumeLoadingState(false);
  //         this.toastr?.warning?.('No resume document is available for this candidate.', 'No Document');
  //         return;
  //       }

  //       const full = /[\/\\][^\/\\]+\.[A-Za-z0-9]+$/.test(folder)
  //         ? folder
  //         : this.joinPath(folder, file);

  //       const serverPath = this.normalizeForServer(full);

  //       this.RecruitmentHubService.getOnboardDocument({ filePath: serverPath })
  //         .subscribe({
  //           next: async (resp: any) => {
  //             // resp may be HttpResponse<Blob> (when observe:'response') or a plain Blob.
  //             const blob: Blob = resp && (resp as any).body instanceof Blob
  //               ? (resp as any).body as Blob
  //               : (resp as Blob);

  //             // Case 3a: empty blob
  //             if (!blob || blob.size === 0) {
  //               this.setResumeLoadingState(false);
  //               this.toastr?.warning?.('No document data received from server.', 'No Document');
  //               return;
  //             }

  //             // Case 3b: backend sent JSON error as a blob (e.g., {"message":"File not found"})
  //             const contentTypeHeader = resp && (resp as any).headers ? (resp as any).headers.get?.('Content-Type') : null;
  //             const ctype = (blob as any).type || contentTypeHeader || '';
  //             if (ctype.includes('application/json')) {
  //               try {
  //                 const txt = await blob.text();
  //                 const j = JSON.parse(txt);
  //                 const msg = j?.message || 'File not found';
  //                 this.setResumeLoadingState(false);
  //                 this.toastr?.warning?.(msg, 'No Document');
  //                 return;
  //               } catch {
  //                 // fall through if parsing fails
  //               }
  //             }

  //             // Success: make object URL and show in iframe
  //             if (this.viewerBlobUrl) {
  //               URL.revokeObjectURL(this.viewerBlobUrl);
  //               this.viewerBlobUrl = null;
  //             }
  //             const url = URL.createObjectURL(blob);
  //             this.viewerBlobUrl = url;
  //             this.selectedResume = url;                 // template uses | safeUrl
  //             this.selectedFileName = file || full.split(/[\/\\]/).pop() || 'document';
  //             this.setResumeLoadingState(false);
  //           },
  //           error: async (err: any) => {
  //             // Case 2: HTTP error statuses (404, 403, 500…)
  //             if (err?.status === 404) {
  //               this.toastr?.warning?.('Document not found.', 'No Document');
  //             } else if (err?.error instanceof Blob && err.error.type?.includes('application/json')) {
  //               // Sometimes server returns JSON error blob on error channel
  //               try {
  //                 const txt = await err.error.text();
  //                 const j = JSON.parse(txt);
  //                 this.toastr?.warning?.(j?.message || 'Failed to load document.', 'No Document');
  //               } catch {
  //                 this.toastr?.error?.('Failed to load document preview.', 'Error');
  //               }
  //             } else {
  //               this.toastr?.error?.('Failed to load document preview.', 'Error');
  //             }
  //             this.setResumeLoadingState(false);
  //           }
  //         });
  //     },
  //     error: (err: any) => {
  //       console.error('Error fetching resume path:', err);
  //       this.toastr?.error?.('Could not fetch resume');
  //       this.setResumeLoadingState(false);
  //     }
  //   });
  // }
downloadfilename:string;
  viewCandidate(candidateid: number,firstname:string,lastname:string) {
    this.isloading = true;
    this.setResumeLoadingState(true);

this.downloadfilename = firstname + '_' + lastname ;
    const req = { id: candidateid };

    this.candidatesService.getresumefilepath(req).subscribe({
      next: (x: any) => {

        const fullPath = x?.data?.final_resume;


        // Case 1: missing path
        if (!fullPath) {
          this.setResumeLoadingState(false);
          this.toastr?.warning?.('No resume document is available for this candidate.', 'No Document');
          return;
        }

        const serverPath = this.normalizeForServer(fullPath);

        this.RecruitmentHubService.getOnboardDocument({ filePath: serverPath })
          .subscribe({
            next: async (resp: any) => {

              const blob: Blob = resp && resp.body instanceof Blob ? resp.body : resp;

              if (!blob || blob.size === 0) {
                this.setResumeLoadingState(false);
                this.toastr?.warning?.('No document data received from server.', 'No Document');
                return;
              }

              // JSON error blob check
              const contentTypeHeader = resp?.headers?.get?.('Content-Type');
              const ctype = blob.type || contentTypeHeader || '';

              if (ctype.includes('application/json')) {
                try {
                  const txt = await blob.text();
                  const j = JSON.parse(txt);
                  this.setResumeLoadingState(false);
                  this.toastr?.warning?.(j?.message || 'File not found', 'No Document');
                  return;
                } catch { }
              }

              // success
              if (this.viewerBlobUrl) {
                URL.revokeObjectURL(this.viewerBlobUrl);
                this.viewerBlobUrl = null;
              }

              const url = URL.createObjectURL(blob);
              this.viewerBlobUrl = url;
              this.selectedResume = url;
              this.selectedFileName = fullPath.split(/[\/\\]/).pop() || 'document';
              this.selectedFileServerPath = serverPath;
              this.setResumeLoadingState(false);
            },
            error: async (err: any) => {

              if (err?.status === 404) {
                this.toastr?.warning?.('Document not found.', 'No Document');
              } else if (err?.error instanceof Blob && err.error.type?.includes('application/json')) {
                try {
                  const txt = await err.error.text();
                  const j = JSON.parse(txt);
                  this.toastr?.warning?.(j?.message || 'Failed to load document.', 'No Document');
                } catch {
                  this.toastr?.error?.('Failed to load document preview.', 'Error');
                }
              } else {
                this.toastr?.error?.('Failed to load document preview.', 'Error');
              }

              this.setResumeLoadingState(false);
            }
          });
      },
      error: (err: any) => {
        console.error('Error fetching resume path:', err);
        this.toastr?.error?.('Could not fetch resume');
        this.setResumeLoadingState(false);
      }
    });
  }
  // getDownloadUrl(): string | null {
  //   return this.viewerBlobUrl;
  // }
downloadResume(): void {
  if (!this.selectedFileServerPath) {
    this.toastr?.error?.('No file path found', 'Error');
    return;
  }

  this.RecruitmentHubService.getOnboardDocument({
    filePath: this.selectedFileServerPath,
    mode: 'download' 
  }).subscribe({
        next: async (blob: Blob) => {

        const fileName =this.downloadfilename;
        const extension = fileName.split('.').pop()?.toLowerCase();

        if (extension === 'html' || blob.type.includes('text/html')) {

          const htmlText = await blob.text();

          const iframe = document.createElement('iframe');

          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';

          iframe.style.width = '800px';
          iframe.style.height = '0';
          iframe.style.border = '0';

          document.body.appendChild(iframe);

          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;

          if (!iframeDoc) {
            console.error('Iframe document not available');
            return;
          }

          iframeDoc.open();

          iframeDoc.write(`
            <html>
              <head>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    padding: 30px 40px;
                    line-height: 1.6;
                    color: #000;
                    background: #fff;
                  }

                  img {
                    max-width: 100%;
                  }

                  table {
                    width: 100%;
                    border-collapse: collapse;
                  }
                </style>
              </head>

              <body>
                ${htmlText}
              </body>
            </html>
          `);

          iframeDoc.close();

          setTimeout(async () => {

            const element = iframeDoc.body;

            const options = {
              margin: [10, 10, 10, 10],

              filename: fileName.replace('.html', '.pdf'),

              image: {
                type: 'jpeg',
                quality: 1
              },

              html2canvas: {
                scale: 2,
                useCORS: true,
                scrollY: 0
              },

              jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
              }
            };

            await html2pdf()
              .set(options)
              .from(element)
              .save();

            document.body.removeChild(iframe);

          }, 1000);

        } else {

          const url = URL.createObjectURL(blob);

          const a = document.createElement('a');

          a.href = url;
          a.download = fileName;

          document.body.appendChild(a);

          a.click();

          document.body.removeChild(a);

          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      },

    error: () => {
      this.toastr?.error?.('Download failed', 'Error');
    }
  });
}

downloadResumeDocx(): void {
  if (!this.selectedFileServerPath) {
    this.toastr?.error?.('No file path found', 'Error');
    return;
  }

  this.RecruitmentHubService.getOnboardDocument({
    filePath: this.selectedFileServerPath,
    mode: 'download'
  }).subscribe({
    next: async (blob: Blob) => {

      const fileName = this.downloadfilename;
      const extension = fileName.split('.').pop()?.toLowerCase();

      // HTML Resume -> Word Document
      if (extension === 'html' || blob.type.includes('text/html')) {

        const htmlText = await blob.text();

        const wordContent = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office"
                xmlns:w="urn:schemas-microsoft-com:office:word"
                xmlns="http://www.w3.org/TR/REC-html40">
            <head>
              <meta charset="utf-8">
              <title>Resume</title>

              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 20px;
                }

                table {
                  border-collapse: collapse;
                  width: 100%;
                }

                img {
                  max-width: 100%;
                }
              </style>
            </head>

            <body>
              ${htmlText}
            </body>
          </html>
        `;

        const docBlob = new Blob(
          ['\ufeff', wordContent],
          {
            type: 'application/msword'
          }
        );

        const url = URL.createObjectURL(docBlob);

        const a = document.createElement('a');
        a.href = url;

        a.download = fileName.replace(/\.(html|htm)$/i, '.doc');

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        return;
      }
      

      // Existing DOCX/DOC/PDF/etc.
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;

      a.download = fileName.endsWith('.docx')
        ? fileName
        : fileName.replace(/\.[^/.]+$/, '.docx');

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    },

    error: () => {
      this.toastr?.error?.('DOCX download failed', 'Error');
    }
  });
}

  closeResume() {
    if (this.viewerBlobUrl) {
      URL.revokeObjectURL(this.viewerBlobUrl);
      this.viewerBlobUrl = null;
    }
    this.selectedResume = null;
  }

  onResumeLoaded() {
    this.setResumeLoadingState(false);
  }
  benchFromDate: Date | null = new Date(); // default to today

  moveWithCandidate() {

    if (!this.benchNotes) {
      this.toastr.error('pls fill notes field');
      return;
    }

    if (!this.modelCandidateId) {
      this.toastr.error('Missing candidate id');
      return;
    }
    if (!this.benchFromDate) {
      this.toastr.error('Please pick a bench from date.');
      return;
    }

    this.loadingMove = true;

    const req = {
      candidateId: this.modelCandidateId,
      orgid: this.orgid,
      fromDate: this.toIsoDate(this.benchFromDate),
      recruiterid: this.recruiterid,
      notes: this.benchNotes || ''   // <-- ADD THIS
    };

    this.candidatesService.moveToTalentBench(req).subscribe(
      () => {
        this.loadingMove = false;
        this.toastr.success('Candidate moved to Talent Bench successfully!');
        this.resetModel();
        this.loadPage(1);
      },
      (err) => {
        this.loadingMove = false;
        console.error('Move error:', err);
        this.toastr.error('Failed to move candidate to Talent Bench', 'Oops!');
      }
    );
  }


  ChkPlacementaToTalentBench(candidateid: number) {
    const req = { id: candidateid, orgid: this.orgid };

    this.candidatesService.ChkplacementTotalentbench(req).subscribe(
      (res: any) => {
        if (!res?.success) {
          this.toastr.error('Server check failed. Please try again.', 'Oops!');
          return;
        }

        if (res.alreadyInBench) {
          this.resetModel();
          this.toastr.info(
            `Candidate is already in Talent Bench (ID: ${res.benchId ?? '—'}).`,
            'Already Moved'
          );
          return;
        }
        const normalized = (res.data || []).map((r: PlacementRow) => ({
          ...r,
          ClientId: r.ClientId && r.ClientId !== 0 ? r.ClientId : null,
          VendorId: r.VendorId && r.VendorId !== 0 ? r.VendorId : null,
          SubVendorId: r.SubVendorId && r.SubVendorId !== 0 ? r.SubVendorId : null,
          PartnerId: r.PartnerId && r.PartnerId !== 0 ? r.PartnerId : null
        }));
        this.modelCandidateId = candidateid;
        this.modelRows = normalized;
        this.selectedPlacementId = undefined;
        this.showMoveModel = true;
      },
      (err) => {
        console.error('Error checking placement details:', err);
        this.toastr.error('Server error while checking placement details.', 'Oops!');

      }
    );

  }
  openInlineModal() {
    this.showMoveModel = true;
    document.body.classList.add('no-scroll');
  }
  resetModel() {
    this.showMoveModel = false;
    this.modelRows = [];
    this.modelCandidateId = undefined;
    this.selectedPlacementId = undefined;
    document.body.classList.remove('no-scroll');
  }



  selectPlacement(id: number) {
    this.selectedPlacementId = id;
  }
  trackByPlacementId(index: number, r: { PlacementId: number }): number {
    return r?.PlacementId ?? index; // fallback if PlacementId is missing
  }

  showClient(r: PlacementRow) { return !!(r.ClientName || r.ClientId); }
  showVendor(r: PlacementRow) { return !!(r.VendorName || r.VendorId); }
  showSubVendor(r: PlacementRow) { return !!(r.SubVendorName || r.SubVendorId); }
  showPartner(r: PlacementRow) { return !!(r.PartnerName || r.PartnerId); }

  safe(v: any, fallback: string = '—') { return (v === null || v === undefined || v === '') ? fallback : v; }

  showNotesModal: boolean = false;
  notesText: string = '';
  selectedCandidateForNotes: any = null;

  openNotesModal(candidate: any) {
    this.selectedCandidateForNotes = candidate;
    this.notesText = candidate.notes || '';

    let req = {
      id: candidate

    }
    this.candidatesService.getpreviousnotes(req).subscribe({
      next: (res: any) => {
        console.log('Notes fetched successfully:', res);
        this.lastNotes = res.data.slice(0, 2);
        console.log('Last notes:', this.lastNotes);
      },
      error: (err) => {
        console.error('Error fetching notes:', err);
        this.lastNotes = [];
      }
    });

    this.showNotesModal = true;
  }

  closeNotesModal() {
    this.showNotesModal = false;
    this.notesText = '';
    this.selectedCandidateForNotes = null;
    this.lastNotes = [];
  }

  selectedcandidateid: any;

  openDeleteModal(templateRef: TemplateRef<any>, id: any) {
    this.dialogRef = this.dialog.open(templateRef, {
      disableClose: true
    });
    this.selectedcandidateid = id
  }
  confirmDeleteCandidate() {
    let req = {
      id: this.selectedcandidateid,
      orgid: this.orgid
    }
    this.candidatesService.deletecandidate(req).subscribe({
      next: (res: any) => {
        if (res.success) {
          console.log('candidate deleted successfully');
          this.toastr.success ('candidate deleted successfully!')
          this.loadPage(1);
          this.dialogRef?.close();
        } else {
          console.warn('delete failed', res.message);
          this.toastr.warning('delete failed', res.message)
        }
      },
      error: (err: any) => {
        console.error('API error', err);
        this.toastr.error('API error', err)
      }
    });
  }

  saveNotes() {

    if(this.accesstype === '1'){
      this.toastr.info('Super Admin cannot add notes to candidate');
      return;
    }
    this.isLoading = true;

    const now = new Date();
    const currentDateTime = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ` +
      `${now.getHours().toString().padStart(2, '0')}:` +
      `${now.getMinutes().toString().padStart(2, '0')}:` +
      `${now.getSeconds().toString().padStart(2, '0')}`;

    let req = {
      candidateId: this.selectedCandidateForNotes,
      orgid: this.orgid,
      orgdiv: this.orgdiv,
      createdby: this.recruiterid,
      createdtime: currentDateTime,
      notes: this.notesText
    }

    this.candidatesService.addnotes(req).subscribe((response: any) => {
      console.log('Notes saved successfully:', response);
      this.toastr.success('Notes added Successfully!');
      this.loadPage(1);
      this.isloading = false;
    },
      (error: any) => {
        console.error('Error saving notes:', error);
        this.isloading = false
        this.toastr.error('Error saving notes', 'Oops!');


      })
    this.closeNotesModal();
  }
  jobassignmodal: boolean = false;
  customInput: string = '';
  candidateid: number
  alljobs: any[] = [];
  openjobassignmodal(id: number) {
      if (this.accesstype === '1') {
    this.getorgdivision();
  }
    this.isloading = true;
    this.candidateid = id
    let req = {
      id: this.candidateid,
      orgid: this.orgid,
      orgdiv: this.orgdiv,
      email: this.useremail,
      access: this.accesstype,
      userid: this.recruiterid
    }
    this.jobassignmodal = true;
    this.candidatesService.getAllJobassign(req).subscribe((response: any) => {
      console.log('Jobs fetched successfully:', response);
      this.alljobs = response.data;
      console.log('Jobs List:', this.alljobs.length);
      this.isloading = false;
    },
      (error: any) => {
        console.error('Error fetching jobs:', error);
              this.isloading = false;


      }
    );
  }

  closejobassignmodal() {
    this.jobassignmodal = false;
    this.customInput = '';
  }


  dataSource = new MatTableDataSource<any>();
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  CandidateDetails(candidateId: any) {
    if (candidateId) {
      this.router.navigate(['ats/job/CandidatedetailsComponent', candidateId], { queryParams: { source: '0' } });
    }
  }
  enteremail(email: string, candidateId: number) {
    console.log('Email:', email, 'Candidate ID:', candidateId);
    if (email && candidateId) {

      this.router.navigate(['emailintegration/gmail-inbox'],  { queryParams: { email: this.integrated_mail, candidateemail: email, candidateId: candidateId } }
      );
    } else {
      console.error('Email or Candidate ID is missing');
    }
  }
  showFullText = false;

  toggleText() {
    this.showFullText = !this.showFullText;
  }
  toggleIcons(candidateId: number): void {
    this.activeIconCandidateId = this.activeIconCandidateId === candidateId ? null : candidateId;
  }

  trackById(_index: number, item: any) {
    return item.id;
  }

  getDaysAgo(dateString: string | Date): string {
    const postedDate = new Date(dateString);
    const today = new Date();
    const diffInMs = today.getTime() - postedDate.getTime();
    const CreatedAt = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (CreatedAt === 0) return 'today';
    if (CreatedAt === 1) return '1 day';
    return `${CreatedAt} days`;
  }
  private toIsoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private startOfWeekMonday(d: Date): Date {
    const x = new Date(d);
    const day = x.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diffToMon);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private endOfWeekMonday(d: Date): Date {
    const start = this.startOfWeekMonday(d);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }




  setToday(): void {
    const now = new Date();
    const iso = this.toIsoDate(now);

    this.fromDate = iso;
    this.toDate = iso;

    this.startDate = now;
    this.endDate = now;

    this.menuTrigger?.closeMenu();
    this.onAnyFilterChanged();
  }

  setThisWeek(): void {
    const now = new Date();
    const start = this.startOfWeekMonday(now);
    const end = this.endOfWeekMonday(now);

    this.fromDate = this.toIsoDate(start);
    this.toDate = this.toIsoDate(end);

    this.startDate = start;
    this.endDate = end;

    this.menuTrigger?.closeMenu();
    this.onAnyFilterChanged();
  }

  setThisMonth(): void {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    this.fromDate = this.toIsoDate(start);
    this.toDate = this.toIsoDate(end);

    this.startDate = start;
    this.endDate = end;

    this.menuTrigger?.closeMenu();
    this.onAnyFilterChanged();
  }

  applyDatePickers(): void {
    if (this.startDate) this.fromDate = this.toIsoDate(this.startDate);
    if (this.endDate) this.toDate = this.toIsoDate(this.endDate);

    if (this.fromDate && this.toDate) {
      this.onAnyFilterChanged();
    }
  };
  cancelDateFilter(): void {
    this.showCustomDateFilter = false;
  }

  cancelExperienceFilter() {
    this.minExperience = null;
    this.maxExperience = null;

    if (this.experienceMenuTrigger) {
      this.experienceMenuTrigger.closeMenu();
    }
  }

  getGroupDetails(): void {
    this.candidatesService.getGroupDetails(this.orgid, this.orgdiv, this.accesstype, this.recruiterid).subscribe({
      next: (res: any) => {
        const raw = Array.isArray(res) ? res :
          Array.isArray(res?.data) ? res.data :
            Array.isArray(res?.data?.groups) ? res.data.groups :
              Array.isArray(res?.groups) ? res.groups : [];

        this.groupList = raw.map((g: any): Group => ({
          Groupid: Number(g.Groupid ?? g.GID ?? g.id ?? g.groupId),
          GroupName: String(g.GroupName ?? g.groupName ?? g.name ?? ''),
          Active: g.Active ?? true,
          CandidateIds: this.parseCandidateIds(
            g.CandidateIds ?? g.candidateIds ?? g.candidateids ?? g.candidate_ids ?? g.candidatesid
          ),
        }));

        if (this.candidates?.length) {
          // this.syncCandidatesWithGroups();
        }
      },
      error: (error) => {
        this.toastr.error("Failed to fetch groups", "Error");
        console.error(error);
      }
    });
  }

  // private syncCandidatesWithGroups(): void {
  //   this.candidates.forEach(candidate => {
  //     const cid = this.toNumberId(candidate.candidate_id);
  //     if (cid != null) {
  //       const foundGroup = this.groupList.find(grp =>
  //         grp.CandidateIds?.includes(cid)
  //       );
  //       candidate.selectedGroupId = foundGroup ? foundGroup.Groupid : null;
  //     } else {
  //       candidate.selectedGroupId = null;
  //     }
  //   });

  //   setTimeout(() => this.cdr.detectChanges(), 0);
  //   console.log("✅ Candidates updated:", this.candidates);
  // }


  private parseCandidateIds(val: any): number[] {
    if (val == null) {
      return [];
    }

    // Already an array (could be [1,2] or [[1,104],[2,104]] )
    if (Array.isArray(val)) {
      const result: number[] = [];

      for (const item of val) {
        if (Array.isArray(item)) {
          // e.g. [2252, 104] → take first as candidateId
          const n = Number(item[0]);
          if (!Number.isNaN(n)) {
            result.push(n);
          }
        } else {
          const n = Number(item);
          if (!Number.isNaN(n)) {
            result.push(n);
          }
        }
      }

      // Deduplicate
      return Array.from(new Set(result));
    }

    // Number
    if (typeof val === 'number') {
      return [val];
    }

    // String: could be "1,2,3" or "[[2252,104],[2251,104],...]"
    if (typeof val === 'string') {
      const s = val.trim();
      if (!s) {
        return [];
      }

      // Try JSON first
      if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('"[') && s.endsWith(']"'))) {
        try {
          const parsed = JSON.parse(s);
          // Reuse the same logic for arrays / nested arrays
          return this.parseCandidateIds(parsed);
        } catch {
          // fall through to regex parsing
        }
      }

      // Fallback: grab all numbers from the string
      const matches = s.match(/\d+/g);
      if (!matches) return [];

      const nums = matches.map(x => Number(x)).filter(n => !Number.isNaN(n));
      return Array.from(new Set(nums));
    }

    return [];
  }


  private toNumberId(val: any): number | null {
    const n = Number(val);
    return isNaN(n) ? null : n;
  }

  onSelectGroup(candidate: any, groupId: string | number | null) {

  
    if (groupId === 'add_new') {
      candidate.selectedGroupId = null;
      this.openModal();
      this.isLoading = false;
      return;
    }
    if(this.accesstype === '1'){
  this.toastr.info('Only Created Recruiter can assign group to candidate');
  return;
}
  this.isLoading = true;

    const numericGroupId = groupId != null ? Number(groupId) : null;
    candidate.selectedGroupId = numericGroupId;

    const cid = this.toNumberId(candidate.candidate_id);
    const cmail = candidate.email;
    const number = candidate.phonenumber;
    if (!cid || !number || !cmail) {
      this.toastr.error('Missing required fields Email and Number');
      this.isLoading = false;
      return;
    };

    const payload = {
      candidateIds: [cid],
      groupid: numericGroupId,
      orgid: Number(this.orgid),
      orgdiv: Number(this.orgdiv),
      recruiterid: Number(this.recruiterid),
    };

    // const g = this.groupList.find(x => x.Groupid === numericGroupId);
    // if (g) {
    //   g.CandidateIds ||= [];
    //   if (!g.CandidateIds.includes(cid)) {
    //     g.CandidateIds.push(cid);
    //   }
    // }
    const g = this.groupList.find(x => x.Groupid === numericGroupId);

    if (g) {
      g.CandidateIds ||= [];

      if (g.CandidateIds.includes(cid)) {
        this.toastr.warning(
          'This candidate is already added to this group',
          'Already Exists'
        );
        this.isLoading = false;
        return; // ⛔ stop here
      }

      // Only push if not exists
      g.CandidateIds.push(cid);
    }

    this.candidatesService.assignCandidatesToGroup(payload).subscribe({
      next: () => {


        const groupsForThisCandidate = this.groupList.filter(
          grp => Array.isArray(grp.CandidateIds) && grp.CandidateIds.includes(cid)
        );

        if (groupsForThisCandidate.length > 1) {
          this.toastr.info(
            `This candidate is in ${groupsForThisCandidate.length} groups.`,
            'Multiple Groups'
          );
        } else {
          this.toastr.success(`Candidate added to ${groupsForThisCandidate[0].GroupName}`, 'Group Assigned');
        }
        this.isLoading = false
      },
      error: (err) => {
        
        if (g) g.CandidateIds = (g.CandidateIds || []).filter(id => id !== cid);
        this.toastr.error('Failed to update group');
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  compareGroupIds = (a: number | string | null, b: number | string | null): boolean => {
    return a != null && b != null && Number(a) === Number(b);
  };



  trackByGroup = (_: number, g: { Groupid: number }) => g.Groupid;

  assignCandidateToGroup(candidate: any, groupId: number | null) {
    this.onSelectGroup(candidate.selectedGroupId || groupId, groupId);
  }

  openModal() {
    this.showModal.set(true);
     if (this.accesstype === '1') {
    this.getorgdivision();
  }
  }

  closeModal() {
    this.showModal.set(false);
    this.name = '';

  }

selectedorgdiv: number | null = null;
  submit() {
    this.isloading = true;
    const groupName = this.name?.trim().toLowerCase();
    if (!groupName) {
      this.toastr.warning('Please enter a group name.');
      this.isloading = false;
      return;
    }
    const alreadyExists = this.groupList.some(
      (g: any) => (g.name || g.GroupName || '').trim().toLowerCase() === groupName
    );

    if (alreadyExists) {
      this.toastr.warning('This group name already exists. Please choose another.');
      this.isloading = false;
      return;
    }
      if (this.accesstype === '1' && !this.selectedorgdiv) {
    this.toastr.warning('Please select a division.');
    this.isloading = false;
    return;
  }
 const payloadorgdiv =
    this.accesstype === '1'
      ? this.selectedorgdiv
      : this.orgdiv;
    const req = {
      orgid: this.orgid,
      orgdiv: payloadorgdiv,
      recruiterid: this.recruiterid,
      name: this.name.trim()
    };

    this.candidatesService.createGroup(req).subscribe({
      next: (response: any) => {
        this.name = '';
        this.showModal.set(false);
        this.isloading = false;
        this.selectedorgdiv = null;
        this.closeModal();
        this.toastr.success('Group created successfully!');
        this.getGroupDetails();
      },
      error: (error: any) => {
        console.error('Error creating group:', error);
        this.toastr.error('Failed to create group', 'Oops!');
        this.isloading = false;
      }
    });
  }




  isDuplicateName(): boolean {
    const groupName = this.name?.trim().toLowerCase();
    return this.groupList.some(
      (g: any) => (g.name || g.GroupName || '').trim().toLowerCase() === groupName
    );
  }


  openRecruiterFilter() { this.isRecruiterFilterVisible = true; this.menuTrigger?.closeMenu(); }
  showRecruiterFilter() { this.openRecruiterFilter(); } // keeps your existing (click) handler working
  closeRecruiterFilter() { this.isRecruiterFilterVisible = false; }

  resetRecruiterFilter() {
    this.selectedRecruiter = null;
    this.selectedGroupIds = [];
    this.location = '';
    this.minExp = null;
    this.maxExp = null;
    this.startDate = null;
    this.endDate = null;
    this.selectedCandidateStatusId = null;   // ✅
    this.selectedLegalStatusId = null;
    this.selectedSource = null;               // ✅ NEW
    this.onAnyFilterChanged();
    this.loadPage(1);

  }

  reqruiterList() {
    const req = { orgid: this.orgid, orgdiv: this.orgdiv, access: this.accesstype, userid: this.recruiterid };
    this.candidatesService.getRecruiterList(req).subscribe((response: any) => {
      this.recruiterList = (response?.recruiterList ?? []).map((r: any) => ({
        id: +r.id,
        name: (r.name ?? '').trim()
      }));
    });
  }



  private candidateRecruiterId(c: any): number | null {
    const id = c?.userId ?? c?.createdby ?? c?.recruiter_id; // handle API variants
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }

  onSelectMultipleGroups(candidate: any) {
    const cid = this.toNumberId(candidate.candidate_id);
    if (!cid) return;

    const selectedGroupIds: number[] = candidate.selectedGroupIds || [];

    this.groupList.forEach(g => {
      g.CandidateIds = g.CandidateIds || [];

      if (selectedGroupIds.includes(g.Groupid)) {
        if (!g.CandidateIds.includes(cid)) g.CandidateIds.push(cid);
      } else {
        g.CandidateIds = g.CandidateIds.filter(id => id !== cid);
      }
    });

    for (const groupId of selectedGroupIds) {
      const payload = {
        candidateIds: [cid],
        groupid: groupId,
        orgid: Number(this.orgid),
        orgdiv: Number(this.orgdiv),
        recruiterid: Number(this.recruiterid)
      };


      this.candidatesService.assignCandidatesToGroup(payload).subscribe({
        next: () => {
          const count = selectedGroupIds.length;
          const names = this.groupList
            .filter(g => selectedGroupIds.includes(g.Groupid))
            .map(g => g.GroupName)
            .join(', ');

          if (count > 1) {
            this.toastr.info(
              `Candidate is in ${count} groups: ${names}`,
              'Multiple Groups'
            );
          } else if (count === 1) {
            this.toastr.success(`Candidate added to ${names}`);
          } else {
            this.toastr.warning('Candidate removed from all groups');
          }
        },
        error: (err) => {
          console.error('Failed to assign groups:', err);
          this.toastr.error('Error assigning candidate to groups');
        }
      });
    }
  }


  groupsForCandidate(c: any): string[] {
    const id = this.toNumberId(c.candidate_id);
    if (id == null) return [];
    return this.groupList
      .filter(g => Array.isArray(g.CandidateIds) && g.CandidateIds.includes(id))
      .map(g => g.GroupName);
  }

  get selectedGroupNames(): string[] {
    return this.groupList
      .filter(g => this.selectedGroupIds.includes(g.Groupid))
      .map(g => g.GroupName);
  }

  getFilteredGroupNames(candidate: any): string[] {
    const allGroups = this.groupsForCandidate(candidate);
    if (!this.selectedGroupIds?.length) return [];

    const selectedNames = this.groupList
      .filter(g => this.selectedGroupIds.includes(g.Groupid))
      .map(g => g.GroupName);

    return allGroups.filter(g => selectedNames.includes(g));
  }

  toggleNoteExpansion(note: any): void {
    note.expanded = !note.expanded;
  }

  isTruncated(text: string | null | undefined): boolean {
    return !!text && text.length > 150;
  }
  contactRecruiter(email: string | null | undefined): void {
    if (!email) return;
    window.location.href = 'mailto:' + email;
  }

  getSkillsText(skills: string | null): string {
  return (skills || '').slice(0, 30);
}

hasMoreSkills(skills: string | null): boolean {
  return (skills || '').length > 30;
}

showOrgDivModal = false;
selectedOrgDiv: number | null = null;
selectedJobId: number;
orgdivision:any[]=[];

assignJob(id: number) {
  if (this.accesstype === '1' && !this.selectedOrgDiv) {
    this.toastr.warning('Please select a division first');
    return;
  }

  const finalOrgDiv = this.accesstype === '1'
    ? this.selectedOrgDiv
    : this.orgdiv;

  this.assignCandidate(id, finalOrgDiv);
}

assignCandidate(jobId: number, orgdiv: number) {
  this.isloading = true;

  const req = {
    jobid: jobId,
    candidateid: this.candidateid,
    recruiterid: this.recruiterid,
    orgdiv: orgdiv,
    orgid: this.orgid
  };

  this.candidatesService.assignJobToCandidate(req).subscribe({
    next: () => {
      this.isloading = false;
      this.closejobassignmodal();

      this.toastr.success('Candidate Assigned Successfully!');
      this.selectedOrgDiv = null;
      this.loadPage(1);
    },
    error: (error: any) => {
      this.isloading = false;
      console.error('Error Assigning candidate:', error);
      this.toastr.error('Oops! Error assigning candidate');
    }
  });
}
getorgdivision(){
  this.myprofile.getDivision(this.orgid).subscribe((x:any)=>{
this.orgdivision = x;

  },
(err:any)=>{
  console.error('Error fetching org division',err);
}
)
}

isLocationTruncated(candidate: any): boolean {
  const location =
    (candidate.STATE_NAME || '') + ', ' + (candidate.CITY || '');

  return location.length > 30;
}
getLocation(candidate: any): string {
  const location = [
    candidate?.STATE_NAME,
    candidate?.CITY
  ]
    .filter(Boolean)
    .join(', ');

  return location || '-';
}
}


interface socialcards {
  id: number;
  imgSrc: string;
  username: string;
  post: string;
}
interface Group {
  CandidateIds: number[];
  Groupid: number;
  GroupName: string;
  Active?: boolean;
}



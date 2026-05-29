import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { ReportService, Winner } from '../../services/report.service';
import { Evento } from '../../shared/models/event.model';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-event-results',
    templateUrl: './event-results.component.html',
    styleUrls: ['./event-results.component.scss']
})
export class EventResultsComponent implements OnInit {
    eventId: string | null = null;
    event: Evento | null = null;
    winners: Winner[] = [];
    allParticipants: Winner[] = [];
    loading = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private eventService: EventService,
        private reportService: ReportService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.eventId = this.route.snapshot.paramMap.get('id');
        if (this.eventId) {
            this.loadData(this.eventId);
        } else {
            this.router.navigate(['/admin']);
        }
    }

    loadData(id: string): void {
        this.loading = true;

        // Load event details first
        this.eventService.getEventById(id).subscribe({
            next: (event) => {
                this.event = event;
                // Then load winners
                this.loadWinners(id);
            },
            error: (err) => {
                console.error('Error loading event', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el evento' });
                this.loading = false;
            }
        });
    }

    loadWinners(id: string): void {
        this.reportService.getWinners(id).subscribe({
            next: (res) => {
                this.winners = res.winners;
                this.allParticipants = res.allParticipants;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading winners', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los resultados' });
                this.loading = false;
            }
        });
    }

    getWinnersByRank(rank: number): Winner[] {
        return this.winners.filter(w => w.rank === rank);
    }

    getRankColor(rank: number): string {
        switch (rank) {
            case 1: return 'text-yellow-500'; // Gold
            case 2: return 'text-gray-400';   // Silver
            case 3: return 'text-orange-500'; // Bronze
            default: return 'text-700';
        }
    }

    getRankIcon(rank: number): string {
        switch (rank) {
            case 1: return 'pi pi-star-fill';
            case 2: return 'pi pi-star-fill';
            case 3: return 'pi pi-star-fill';
            default: return 'pi pi-user';
        }
    }
}

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbsenceService } from '../../../core/services/absence.service';
import { AuthService } from '../../../core/services/auth.service';
import { Falta, FaltaStatus } from '../../../core/models';

interface DayCell {
  day: number;
  isToday: boolean;
  isWeekend: boolean;
}

interface AbsenceBar {
  startCol: number; // 1-indexed day in month
  endCol: number;
  colSpan: number;
  color: string;
  falta: Falta;
}

interface EmployeeRow {
  name: string;
  isCurrentUser: boolean;
  bars: AbsenceBar[];
}

@Component({
  selector: 'app-faltas-calendario',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50/30 p-4 sm:p-8">

      <!-- Header -->
      <header class="mb-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <h1 class="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Calendário de Equipa</h1>
            </div>
            <p class="text-gray-500 font-medium ml-1">Visão geral das ausências aprovadas por colaborador.</p>
          </div>

          <!-- Month Navigation -->
          <div class="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
            <button (click)="prevMonth()"
                    class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-90">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div class="text-center min-w-[140px]">
              <span class="text-sm font-black text-gray-900">{{ monthLabel() }}</span>
            </div>
            <button (click)="nextMonth()"
                    class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 active:scale-90">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-4 mb-6 no-print">
        <div class="flex items-center gap-2 text-xs font-bold text-gray-500">
          <div class="w-4 h-4 rounded bg-blue-400 opacity-80"></div>
          Ausência aprovada
        </div>
        <div class="flex items-center gap-2 text-xs font-bold text-gray-500">
          <div class="w-4 h-4 rounded bg-blue-100 border-2 border-blue-600"></div>
          Hoje
        </div>
        <div class="flex items-center gap-2 text-xs font-bold text-blue-600">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4"></circle></svg>
          O seu período
        </div>
      </div>

      <!-- Calendar Card -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">

        <!-- Loading -->
        <div *ngIf="loading()" class="flex flex-col items-center py-24 gap-4 text-gray-400">
          <svg class="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span class="text-sm font-medium">A carregar calendário...</span>
        </div>

        <!-- Grid -->
        <div *ngIf="!loading()" class="overflow-x-auto">
          <div class="min-w-[700px]">

            <!-- Day Headers Row -->
            <div class="flex border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10">
              <!-- Name column header -->
              <div class="flex-shrink-0 w-44 px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-100">
                Colaborador
              </div>
              <!-- Day columns -->
              <div class="flex flex-1">
                <div *ngFor="let cell of dayCells()"
                     class="flex-1 min-w-[28px] py-3 text-center text-[10px] font-black transition-colors duration-100"
                     [ngClass]="{
                       'text-blue-600 bg-blue-50': cell.isToday,
                       'text-gray-300': cell.isWeekend && !cell.isToday,
                       'text-gray-400': !cell.isWeekend && !cell.isToday
                     }">
                  <div class="leading-none">{{ cell.day }}</div>
                  <div *ngIf="cell.isToday" class="w-1.5 h-1.5 rounded-full bg-blue-500 mx-auto mt-0.5"></div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div *ngIf="employeeRows().length === 0" class="py-24 text-center">
              <div class="flex flex-col items-center gap-3 text-gray-400">
                <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <p class="text-sm font-bold text-gray-500">Sem ausências aprovadas em {{ monthLabel() }}</p>
                <p class="text-xs text-gray-400">Toda a equipa está disponível este mês.</p>
              </div>
            </div>

            <!-- Employee Rows -->
            <div *ngFor="let row of employeeRows(); let last = last"
                 class="flex items-stretch hover:bg-gray-50/50 transition-colors duration-150 group"
                 [class.border-b]="!last"
                 [class.border-gray-50]="!last">

              <!-- Name cell -->
              <div class="flex-shrink-0 w-44 px-4 py-4 border-r border-gray-100 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 border"
                     [style.background-color]="getColor(row.name, 0.15)"
                     [style.color]="getColor(row.name, 1)"
                     [style.border-color]="getColor(row.name, 0.3)">
                  {{ row.name.substring(0, 2).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-black text-gray-800 truncate">{{ row.name }}</div>
                  <div *ngIf="row.isCurrentUser" class="text-[9px] font-bold text-blue-500 uppercase tracking-wide">Eu</div>
                </div>
              </div>

              <!-- Days cells area (relative for absolute bars) -->
              <div class="flex flex-1 relative">
                <!-- Background day grid lines -->
                <div *ngFor="let cell of dayCells()"
                     class="flex-1 min-w-[28px] border-r border-gray-50/80 last:border-r-0"
                     [ngClass]="{ 'bg-blue-50/30': cell.isToday }">
                </div>

                <!-- Absence bars (absolutely positioned over the day grid) -->
                <div class="absolute inset-0 flex items-center pointer-events-none px-0">
                  <ng-container *ngFor="let bar of row.bars">
                    <!-- Bar wrapper using CSS grid positioning trick -->
                    <div class="absolute top-1/2 -translate-y-1/2 h-7 rounded-lg flex items-center px-2 overflow-hidden pointer-events-auto cursor-default group/bar"
                         [style.left]="getBarLeft(bar)"
                         [style.width]="getBarWidth(bar)"
                         [style.background-color]="bar.color"
                         [title]="getTooltipText(bar.falta)">

                      <!-- Inner label -->
                      <span class="text-[10px] font-black text-white truncate drop-shadow-sm">
                        {{ bar.falta.startDate | date:'dd/MM' }} – {{ bar.falta.endDate | date:'dd/MM' }}
                        · {{ calcDays(bar.falta) }}d
                      </span>

                      <!-- Tooltip popup -->
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 invisible group-hover/bar:visible opacity-0 group-hover/bar:opacity-100 transition-all duration-200 pointer-events-none">
                        <div class="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl min-w-[160px] text-center whitespace-nowrap">
                          <div class="font-black">{{ bar.falta.requesterName }}</div>
                          <div class="text-gray-300 font-medium mt-0.5">
                            {{ bar.falta.startDate | date:'dd MMM' }} → {{ bar.falta.endDate | date:'dd MMM yyyy' }}
                          </div>
                          <div class="text-blue-300 font-black mt-0.5">{{ calcDays(bar.falta) }} dias</div>
                        </div>
                        <!-- Tooltip arrow -->
                        <div class="w-2.5 h-2.5 bg-gray-900 rotate-45 mx-auto -mt-1.5"></div>
                      </div>
                    </div>
                  </ng-container>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      <!-- Summary Footer -->
      <div *ngIf="!loading() && employeeRows().length > 0" class="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div class="p-2 bg-blue-50 rounded-xl">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Colaboradores Ausentes</p>
            <p class="text-xl font-black text-gray-900">{{ employeeRows().length }}</p>
          </div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div class="p-2 bg-rose-50 rounded-xl">
            <svg class="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total de Ausências</p>
            <p class="text-xl font-black text-gray-900">{{ totalAbsencesThisMonth() }}</p>
          </div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
          <div class="p-2 bg-emerald-50 rounded-xl">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest">Dias Totais Perdidos</p>
            <p class="text-xl font-black text-gray-900">{{ totalDaysLostThisMonth() }} dias</p>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class FaltasCalendarioComponent implements OnInit {
  private absenceService = inject(AbsenceService);
  private authService = inject(AuthService);

  loading = signal(true);
  currentDate = signal(new Date());
  allApprovedAbsences = signal<Falta[]>([]);

  // ─── Month Navigation ────────────────────────────────────────────
  monthLabel = computed(() => {
    const d = this.currentDate();
    return d.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase());
  });

  prevMonth() {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() - 1);
    this.currentDate.set(d);
  }

  nextMonth() {
    const d = new Date(this.currentDate());
    d.setMonth(d.getMonth() + 1);
    this.currentDate.set(d);
  }

  // ─── Day Cells ───────────────────────────────────────────────────
  dayCells = computed<DayCell[]>(() => {
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      const dow = date.getDay();
      return {
        day,
        isToday:
          today.getDate() === day &&
          today.getMonth() === month &&
          today.getFullYear() === year,
        isWeekend: dow === 0 || dow === 6
      };
    });
  });

  daysInCurrentMonth = computed(() => this.dayCells().length);

  // ─── Filter absences that intersect with the current month ───────
  absencesThisMonth = computed(() => {
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

    return this.allApprovedAbsences().filter(f => {
      const start = new Date(f.startDate);
      const end = new Date(f.endDate);
      return start <= monthEnd && end >= monthStart;
    });
  });

  // ─── Build employee rows with bars ───────────────────────────────
  employeeRows = computed<EmployeeRow[]>(() => {
    const d = this.currentDate();
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = this.daysInCurrentMonth();
    const currentUser = this.authService.currentUserValue;

    // Group by requester name
    const grouped: Map<string, Falta[]> = new Map();
    this.absencesThisMonth().forEach(f => {
      const name = f.requesterName || 'Utilizador';
      if (!grouped.has(name)) grouped.set(name, []);
      grouped.get(name)!.push(f);
    });

    // Build rows
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, faltas]) => {
        const bars: AbsenceBar[] = faltas.map(f => {
          const fStart = new Date(f.startDate);
          const fEnd = new Date(f.endDate);

          // Clamp to current month boundaries
          const startDay = fStart.getMonth() === month && fStart.getFullYear() === year
            ? fStart.getDate()
            : 1;
          const endDay = fEnd.getMonth() === month && fEnd.getFullYear() === year
            ? fEnd.getDate()
            : daysInMonth;

          return {
            startCol: startDay,
            endCol: endDay,
            colSpan: endDay - startDay + 1,
            color: this.getColor(name, 0.75),
            falta: f
          };
        });

        return {
          name,
          isCurrentUser: currentUser?.name === name,
          bars
        };
      });
  });

  // ─── Bar position helpers ─────────────────────────────────────────
  getBarLeft(bar: AbsenceBar): string {
    const totalDays = this.daysInCurrentMonth();
    const leftPct = ((bar.startCol - 1) / totalDays) * 100;
    return `calc(${leftPct}% + 2px)`;
  }

  getBarWidth(bar: AbsenceBar): string {
    const totalDays = this.daysInCurrentMonth();
    const widthPct = (bar.colSpan / totalDays) * 100;
    return `calc(${widthPct}% - 4px)`;
  }

  // ─── Color generation ─────────────────────────────────────────────
  getColor(name: string, alpha: number): string {
    // Deterministic hue from name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    // Avoid yellow-green range which looks bad
    const adjusted = hue < 60 || hue > 200 ? hue : (hue + 120) % 360;
    return `hsla(${adjusted}, 65%, 45%, ${alpha})`;
  }

  // ─── Tooltip & helpers ────────────────────────────────────────────
  getTooltipText(falta: Falta): string {
    const start = new Date(falta.startDate).toLocaleDateString('pt-PT');
    const end = new Date(falta.endDate).toLocaleDateString('pt-PT');
    return `${falta.requesterName} — ${start} a ${end} (${this.calcDays(falta)} dias)`;
  }

  calcDays(falta: Falta): number {
    const diff = new Date(falta.endDate).getTime() - new Date(falta.startDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }

  // ─── Summary stats ────────────────────────────────────────────────
  totalAbsencesThisMonth = computed(() => this.absencesThisMonth().length);

  totalDaysLostThisMonth = computed(() =>
    this.absencesThisMonth().reduce((sum, f) => sum + this.calcDays(f), 0)
  );

  // ─── Init ─────────────────────────────────────────────────────────
  async ngOnInit() {
    try {
      await this.absenceService.loadAbsences();
      this.absenceService.absences$.subscribe(all => {
        const approved = all.filter(f => f.status === FaltaStatus.APROVADO);
        this.allApprovedAbsences.set(approved);
      });
    } finally {
      this.loading.set(false);
    }
  }
}

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { AbsenceService } from '../../core/services/absence.service';
import { Falta, FaltaStatus } from '../../core/models';

@Component({
  selector: 'app-faltas-gestao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50/30 p-4 sm:p-8">
      <!-- Header -->
      <header class="mb-8">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div class="space-y-1">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h1 class="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Gestão de Faltas</h1>
            </div>
            <p class="text-gray-500 font-medium ml-1">Aprovação e rastreabilidade de avisos de ausência.</p>
          </div>

          <!-- Tabs -->
          <nav class="flex p-1.5 bg-gray-200/50 backdrop-blur-md rounded-2xl w-full lg:w-auto shadow-inner border border-gray-100">
            <button (click)="activeTab.set('pending')"
                    [class.tab-active]="activeTab() === 'pending'"
                    class="flex-1 lg:px-8 py-3 text-sm font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
              <span class="w-2 h-2 rounded-full" [class.bg-blue-500]="activeTab() === 'pending'" [class.bg-gray-400]="activeTab() !== 'pending'"></span>
              Pendentes
              <span class="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md text-[10px]" *ngIf="(pendingAbsences$ | async)?.length">
                {{ (pendingAbsences$ | async)?.length }}
              </span>
            </button>
            <button (click)="activeTab.set('history')"
                    [class.tab-active]="activeTab() === 'history'"
                    class="flex-1 lg:px-8 py-3 text-sm font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Histórico
            </button>
          </nav>
        </div>
      </header>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/40 group hover:shadow-xl transition-all duration-300">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">A Aguardar</p>
          <p class="text-3xl font-black text-gray-900">{{ pendingCount() }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/40 group hover:shadow-xl transition-all duration-300">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
          </div>
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Aprovados</p>
          <p class="text-3xl font-black text-gray-900">{{ approvedCount() }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/40 group hover:shadow-xl transition-all duration-300">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
          </div>
          <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Rejeitados</p>
          <p class="text-3xl font-black text-gray-900">{{ rejectedCount() }}</p>
        </div>
      </div>

      <!-- Main Content -->
      <main class="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">

          <!-- Pending View -->
          <div *ngIf="activeTab() === 'pending'" class="p-6 sm:p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-2 h-8 bg-blue-600 rounded-full"></div>
              <h3 class="text-xl font-black text-gray-900">Avisos Pendentes de Aprovação</h3>
            </div>

            <table class="min-w-full divide-y divide-gray-100 hidden md:table">
              <thead>
                <tr>
                  <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Solicitante</th>
                  <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Período</th>
                  <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Dias</th>
                  <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Motivo</th>
                  <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Data Pedido</th>
                  <th class="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Acções</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr *ngFor="let falta of pendingAbsences$ | async" class="hover:bg-gray-50/80 transition-all duration-200">
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600 border-2 border-blue-200">
                        {{falta.requesterName?.substring(0, 2)?.toUpperCase()}}
                      </div>
                      <div>
                        <div class="text-sm font-bold text-gray-900">{{falta.requesterName}}</div>
                        <div class="text-[10px] text-gray-400 font-bold uppercase">Colaborador</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-5">
                    <div class="text-sm font-black text-gray-900">{{falta.startDate | date:'dd/MM/yyyy'}}</div>
                    <div class="text-xs text-gray-400 mt-0.5">até {{falta.endDate | date:'dd/MM/yyyy'}}</div>
                  </td>
                  <td class="px-6 py-5">
                    <span class="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-lg">{{ calcDays(falta) }}d</span>
                  </td>
                  <td class="px-6 py-5">
                    <div class="text-sm text-gray-600 line-clamp-2 max-w-xs">{{falta.reason}}</div>
                  </td>
                  <td class="px-6 py-5 text-xs text-gray-400">{{falta.createdAt | date:'dd/MM/yyyy HH:mm'}}</td>
                  <td class="px-6 py-5 text-right whitespace-nowrap">
                    <div class="flex justify-end gap-2.5">
                      <button (click)="approve(falta.id)" 
                              class="group inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200/60 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-emerald-100 hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
                        <svg class="w-4 h-4 text-emerald-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Aprovar</span>
                      </button>
                      <button (click)="reject(falta.id)" 
                              class="group inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200/60 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-rose-100 hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
                        <svg class="w-4 h-4 text-rose-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        <span>Rejeitar</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="(pendingAbsences$ | async)?.length === 0">
                  <td colspan="6" class="py-24 text-center">
                    <div class="flex flex-col items-center">
                      <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <h4 class="text-lg font-black text-gray-900">Nenhum aviso pendente</h4>
                      <p class="text-sm text-gray-500">Todos os avisos de falta foram processados.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Mobile cards for pending -->
            <div class="md:hidden divide-y divide-gray-100">
              <div *ngFor="let falta of pendingAbsences$ | async" class="p-4 space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600 border-2 border-blue-200">
                    {{falta.requesterName?.substring(0, 2)?.toUpperCase()}}
                  </div>
                  <div>
                    <div class="text-sm font-bold text-gray-900">{{falta.requesterName}}</div>
                    <div class="text-xs text-gray-400">{{falta.startDate | date:'dd/MM'}} — {{falta.endDate | date:'dd/MM/yyyy'}} · {{ calcDays(falta) }}d</div>
                  </div>
                </div>
                <div class="text-sm text-gray-600">{{falta.reason}}</div>
                <div class="flex gap-2.5 mt-2">
                  <button (click)="approve(falta.id)" 
                          class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl text-emerald-700 bg-emerald-50 border border-emerald-200/60 hover:bg-emerald-600 hover:text-white transition-all duration-300 active:scale-95">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Aprovar
                  </button>
                  <button (click)="reject(falta.id)" 
                          class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl text-rose-700 bg-rose-50 border border-rose-200/60 hover:bg-rose-600 hover:text-white transition-all duration-300 active:scale-95">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Rejeitar
                  </button>
                </div>
              </div>
              <div *ngIf="(pendingAbsences$ | async)?.length === 0" class="p-8 text-center text-gray-400 text-sm">Nenhum aviso pendente.</div>
            </div>
          </div>

          <!-- History View -->
          <div *ngIf="activeTab() === 'history'" class="p-6 sm:p-8">
            <!-- Header Toolbar -->
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-6 mb-6 no-print">
              <div class="space-y-1">
                <div class="flex items-center gap-3">
                  <div class="w-2 h-8 bg-blue-500 rounded-full"></div>
                  <h3 class="text-xl font-black text-gray-900">Histórico & Relatórios</h3>
                </div>
                <p class="text-xs font-medium text-gray-400">Consulte ou extraia relatórios mensais detalhados.</p>
              </div>

              <!-- Controls -->
              <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <!-- Mode Toggle -->
                <div class="flex bg-gray-100 p-1 rounded-xl text-xs font-bold shadow-inner">
                  <button (click)="viewMode.set('monthly')"
                          [class.bg-white]="viewMode() === 'monthly'"
                          [class.shadow-sm]="viewMode() === 'monthly'"
                          class="px-3 py-1.5 rounded-lg transition-all">
                    Mensal
                  </button>
                  <button (click)="viewMode.set('all')"
                          [class.bg-white]="viewMode() === 'all'"
                          [class.shadow-sm]="viewMode() === 'all'"
                          class="px-3 py-1.5 rounded-lg transition-all">
                    Completo
                  </button>
                </div>

                <!-- Monthly Pickers -->
                <ng-container *ngIf="viewMode() === 'monthly'">
                  <select [(ngModel)]="selectedMonth" 
                          class="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option *ngFor="let m of monthsList" [value]="m.value">{{ m.label }}</option>
                  </select>
                  <select [(ngModel)]="selectedYear" 
                          class="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option *ngFor="let y of yearsList" [value]="y">{{ y }}</option>
                  </select>
                </ng-container>

                <!-- Actions -->
                <button (click)="exportToCSV()" 
                        class="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 inline-flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Excel
                </button>
                <button (click)="printReport()" 
                        class="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200/60 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 inline-flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Imprimir
                </button>
              </div>
            </div>

            <!-- Printable Header (Only visible on print) -->
            <div class="hidden print-header mb-6">
              <h2 class="text-2xl font-black text-gray-900">Relatório Mensal de Faltas — KayPro</h2>
              <p class="text-sm font-medium text-gray-500">Período: {{ viewMode() === 'monthly' ? monthsList[selectedMonth()].label + ' de ' + selectedYear() : 'Histórico Completo' }}</p>
              <hr class="my-4 border-gray-200">
            </div>

            <!-- Monthly Report Mini-Dashboard (Only shown if monthly mode is selected) -->
            <div *ngIf="viewMode() === 'monthly'" class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <!-- Card 1 -->
              <div class="bg-blue-50/40 p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
                <div>
                  <p class="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-0.5">Dias Perdidos (Aprovados)</p>
                  <p class="text-2xl font-black text-gray-900">{{ monthlyStats().totalDays }} dias</p>
                </div>
                <div class="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
              </div>

              <!-- Card 2 -->
              <div class="bg-rose-50/40 p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
                <div>
                  <p class="text-[10px] font-black text-rose-600 uppercase tracking-wider mb-0.5">Colaborador mais Ausente</p>
                  <p class="text-lg font-black text-gray-900 truncate max-w-[170px]" [title]="monthlyStats().topEmployeeName">
                    {{ monthlyStats().topEmployeeName }}
                  </p>
                  <span class="text-xs font-bold text-gray-400" *ngIf="monthlyStats().topEmployeeDays > 0">Soma: {{ monthlyStats().topEmployeeDays }} dias</span>
                </div>
                <div class="p-3 bg-rose-100 text-rose-600 rounded-xl">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
              </div>

              <!-- Card 3 -->
              <div class="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between">
                <div>
                  <p class="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-0.5">Total de Ausências</p>
                  <p class="text-2xl font-black text-gray-900">{{ monthlyStats().totalAbsences }} registos</p>
                </div>
                <div class="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
            </div>

            <!-- Two-Column Layout (List on Left, Ranking on Right) -->
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <!-- Left: Absences List -->
              <div class="xl:col-span-2 space-y-4">
                <div class="flex items-center gap-2 mb-2 no-print">
                  <h4 class="text-sm font-black text-gray-400 uppercase tracking-widest">Listagem Detalhada</h4>
                  <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[10px] font-bold">{{ filteredAbsences().length }}</span>
                </div>

                <div class="overflow-hidden border border-gray-100 rounded-2xl">
                  <table class="min-w-full divide-y divide-gray-100 hidden md:table bg-white">
                    <thead>
                      <tr class="bg-gray-50/80">
                        <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Solicitante</th>
                        <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Período</th>
                        <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Dias</th>
                        <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Motivo</th>
                        <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Status</th>
                        <th class="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] no-print">Observação</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      <tr *ngFor="let falta of filteredAbsences()" class="hover:bg-gray-50/50 transition-all duration-200">
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600 border border-blue-100">
                              {{falta.requesterName?.substring(0, 2)?.toUpperCase()}}
                            </div>
                            <span class="text-sm font-bold text-gray-700">{{falta.requesterName}}</span>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="text-sm font-bold text-gray-900">{{falta.startDate | date:'dd/MM/yyyy'}}</div>
                          <div class="text-xs text-gray-400">até {{falta.endDate | date:'dd/MM/yyyy'}}</div>
                        </td>
                        <td class="px-6 py-4">
                          <span class="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-black rounded-lg">{{ calcDays(falta) }}d</span>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" [title]="falta.reason">{{falta.reason}}</td>
                        <td class="px-6 py-4">
                          <span class="px-2.5 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-wider inline-flex items-center"
                                [ngClass]="{
                                  'bg-amber-50 text-amber-700 border border-amber-100': falta.status === 'Pendente',
                                  'bg-emerald-50 text-emerald-700 border border-emerald-100': falta.status === 'Aprovado',
                                  'bg-rose-50 text-rose-700 border border-rose-100': falta.status === 'Rejeitado'
                                }">
                            {{falta.status}}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-500 italic max-w-[150px] truncate no-print" [title]="falta.rejectionReason || ''">
                          {{falta.rejectionReason || '—'}}
                        </td>
                      </tr>
                      <tr *ngIf="filteredAbsences().length === 0">
                        <td colspan="6" class="py-20 text-center text-gray-400 text-sm font-medium italic">Nenhum registo encontrado para este período.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Mobile cards for filtered list -->
                <div class="md:hidden divide-y divide-gray-100 border border-gray-100 rounded-2xl bg-white overflow-hidden">
                  <div *ngFor="let falta of filteredAbsences()" class="p-4 space-y-2">
                    <div class="flex justify-between items-start">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-[9px] font-black text-blue-600">
                          {{falta.requesterName?.substring(0, 2)?.toUpperCase()}}
                        </div>
                        <span class="text-sm font-bold text-gray-900">{{falta.requesterName}}</span>
                      </div>
                      <span class="px-2 py-0.5 text-[9px] font-black rounded-lg uppercase"
                            [ngClass]="{'bg-amber-50 text-amber-700': falta.status === 'Pendente', 'bg-emerald-50 text-emerald-700': falta.status === 'Aprovado', 'bg-rose-50 text-rose-700': falta.status === 'Rejeitado'}">
                        {{falta.status}}
                      </span>
                    </div>
                    <div class="text-xs text-gray-500">{{falta.startDate | date:'dd/MM/yyyy'}} — {{falta.endDate | date:'dd/MM/yyyy'}} · {{ calcDays(falta) }}d</div>
                    <div class="text-sm text-gray-600">{{falta.reason}}</div>
                    <div *ngIf="falta.rejectionReason" class="text-xs text-rose-600 italic">Obs: {{falta.rejectionReason}}</div>
                  </div>
                  <div *ngIf="filteredAbsences().length === 0" class="p-8 text-center text-gray-400 text-sm">Nenhum registo.</div>
                </div>
              </div>

              <!-- Right: Absences Ranking -->
              <div *ngIf="viewMode() === 'monthly'" class="space-y-4 print-full">
                <div class="flex items-center gap-2 mb-2 no-print">
                  <h4 class="text-sm font-black text-gray-400 uppercase tracking-widest">Ranking Mensal</h4>
                </div>

                <div class="bg-gray-50/50 border border-gray-100 p-6 rounded-2xl shadow-sm">
                  <h5 class="text-sm font-black text-gray-800 mb-4 border-b border-gray-200 pb-2">Acumulado por Colaborador</h5>

                  <div class="space-y-4">
                    <div *ngFor="let item of monthlyStats().ranking; let idx = index" class="space-y-1.5">
                      <div class="flex justify-between items-center text-xs">
                        <div class="flex items-center gap-2">
                          <span class="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[9px]">{{ idx + 1 }}</span>
                          <span class="font-bold text-gray-700">{{ item.name }}</span>
                        </div>
                        <span class="font-black text-gray-900 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg">{{ item.days }}d</span>
                      </div>
                      
                      <!-- Custom visual progress bar -->
                      <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div class="bg-blue-600 h-full rounded-full transition-all duration-500"
                             [style.width.%]="(item.days / (monthlyStats().topEmployeeDays || 1)) * 100"></div>
                      </div>
                    </div>

                    <div *ngIf="monthlyStats().ranking.length === 0" class="py-8 text-center text-xs text-gray-400 italic">
                      Nenhum acumulado neste mês.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .tab-active { @apply bg-white text-blue-600 shadow-xl shadow-blue-500/10 border border-white; }
    @media print {
      body * {
        background: white !important;
        color: black !important;
      }
      app-sidebar, header, nav, .no-print {
        display: none !important;
      }
      main {
        width: 100% !important;
        border: none !important;
        box-shadow: none !important;
      }
      .print-header {
        display: block !important;
      }
      .print-full {
        width: 100% !important;
      }
    }
  `]
})
export class FaltasGestaoComponent implements OnInit {
  private absenceService = inject(AbsenceService);

  activeTab = signal<'pending' | 'history'>('pending');
  pendingCount = signal(0);
  approvedCount = signal(0);
  rejectedCount = signal(0);

  // Month & Year Relatório controls
  viewMode = signal<'monthly' | 'all'>('monthly');
  selectedMonth = signal<number>(new Date().getMonth());
  selectedYear = signal<number>(new Date().getFullYear());

  monthsList = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' }
  ];

  yearsList = [
    new Date().getFullYear() - 1,
    new Date().getFullYear(),
    new Date().getFullYear() + 1
  ];

  // Convert service absences observable to a signal for clean reactive computations
  absencesSignal = signal<Falta[]>([]);

  // Filtered absences based on viewMode, selectedMonth, and selectedYear
  filteredAbsences = computed(() => {
    const list = this.absencesSignal();
    if (this.viewMode() === 'all') {
      return list;
    }
    return list.filter(item => {
      const date = new Date(item.startDate);
      return date.getMonth() === Number(this.selectedMonth()) && date.getFullYear() === Number(this.selectedYear());
    });
  });

  // Calculate monthly stats from APPROVED absences only
  monthlyStats = computed(() => {
    const list = this.absencesSignal().filter(item => {
      const date = new Date(item.startDate);
      return item.status === FaltaStatus.APROVADO &&
             date.getMonth() === Number(this.selectedMonth()) && 
             date.getFullYear() === Number(this.selectedYear());
    });

    let totalDays = 0;
    const userDaysMap: { [key: string]: number } = {};

    list.forEach(item => {
      const days = this.calcDays(item);
      totalDays += days;
      const name = item.requesterName || 'Utilizador';
      userDaysMap[name] = (userDaysMap[name] || 0) + days;
    });

    // Find top absent employee
    let topEmployeeName = 'Nenhum';
    let topEmployeeDays = 0;
    Object.entries(userDaysMap).forEach(([name, days]) => {
      if (days > topEmployeeDays) {
        topEmployeeName = name;
        topEmployeeDays = days;
      }
    });

    // Make a list of workers ranked by absences
    const ranking = Object.entries(userDaysMap)
      .map(([name, days]) => ({ name, days }))
      .sort((a, b) => b.days - a.days);

    return {
      totalDays,
      totalAbsences: list.length,
      topEmployeeName,
      topEmployeeDays,
      ranking
    };
  });

  async ngOnInit() {
    await this.absenceService.loadAbsences();
  }

  constructor() {
    this.absenceService.absences$.subscribe(all => {
      this.absencesSignal.set(all);
      this.pendingCount.set(all.filter(a => a.status === FaltaStatus.PENDENTE).length);
      this.approvedCount.set(all.filter(a => a.status === FaltaStatus.APROVADO).length);
      this.rejectedCount.set(all.filter(a => a.status === FaltaStatus.REJEITADO).length);
    });
  }

  pendingAbsences$ = this.absenceService.absences$.pipe(
    map(abs => abs.filter(a => a.status === FaltaStatus.PENDENTE))
  );

  allAbsences$ = this.absenceService.absences$;

  calcDays(falta: Falta): number {
    const diff = new Date(falta.endDate).getTime() - new Date(falta.startDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }

  async approve(id: string) {
    if (confirm('Aprovar este aviso de falta?')) {
      await this.absenceService.updateStatus(id, FaltaStatus.APROVADO);
    }
  }

  async reject(id: string) {
    const reason = prompt('Motivo da rejeição:');
    if (reason) {
      await this.absenceService.updateStatus(id, FaltaStatus.REJEITADO, reason);
    }
  }

  async refresh() {
    await this.absenceService.loadAbsences();
  }

  exportToCSV() {
    const list = this.filteredAbsences();
    if (list.length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }
    const headers = ['Colaborador', 'Data Inicio', 'Data Fim', 'Dias', 'Motivo', 'Status', 'Observacao'];
    const rows = list.map(item => [
      item.requesterName,
      new Date(item.startDate).toLocaleDateString('pt-PT'),
      new Date(item.endDate).toLocaleDateString('pt-PT'),
      this.calcDays(item),
      item.reason.replace(/"/g, '""'),
      item.status,
      item.rejectionReason ? item.rejectionReason.replace(/"/g, '""') : ''
    ]);

    // Use proper excel safe separator formatting with BOM
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filename = this.viewMode() === 'monthly'
      ? `relatorio_faltas_${this.monthsList[this.selectedMonth()].label.toLowerCase()}_${this.selectedYear()}.csv`
      : 'historico_completo_faltas.csv';
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printReport() {
    window.print();
  }
}

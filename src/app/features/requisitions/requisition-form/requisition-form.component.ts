import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RequisitionService } from '../../../core/services/requisition.service';
import { AuthService } from '../../../core/services/auth.service';
import { ViaturaService } from '../../../core/services/viatura.service';
import { RequisitionType, RequisitionStatus, Requisition, Viatura } from '../../../core/models';

@Component({
  selector: 'app-requisition-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="mb-4 sm:mb-6">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-800">Nova Requisição</h2>
    </div>

    <div class="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- General Fields -->
        <div class="grid grid-cols-1 gap-y-4 sm:gap-y-6 gap-x-4 sm:grid-cols-6 mb-6">
          <div class="sm:col-span-3">
            <label class="block text-sm font-medium text-gray-700">Tipo de Requisição</label>
            <select formControlName="type" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="MATERIAL">Material de Construção</option>
              <option value="COMBUSTIVEL">Combustível</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>
        </div>

        <!-- Combustivel Fields -->
        <div *ngIf="form.get('type')?.value === 'COMBUSTIVEL'" class="bg-gray-50 p-3 sm:p-4 rounded-md mb-6 border border-gray-200">
          <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-4">Detalhes do Abastecimento</h3>
          <div class="grid grid-cols-1 gap-y-4 sm:gap-y-6 gap-x-4 sm:grid-cols-6">
            <div class="sm:col-span-3">
              <label class="block text-sm font-medium text-gray-700">Viatura <span class="text-red-500">*</span></label>
              
              <div *ngIf="viaturas.length > 0; else noViaturas" class="mt-1">
                <select formControlName="vehicleId" class="block w-full pl-3 pr-10 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                  <option value="">Selecione uma viatura...</option>
                  <option *ngFor="let v of viaturas" [value]="v.id">{{v.marca}} - {{v.matricula}}</option>
                </select>
              </div>
              
              <ng-template #noViaturas>
                <div class="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-md">
                   <p class="text-sm text-amber-800 mb-2">Não existem viaturas ativas cadastradas no sistema.</p>
                   <a routerLink="/viaturas" class="inline-flex items-center text-xs font-bold text-amber-900 uppercase hover:underline">
                     Cadastrar viatura agora →
                   </a>
                </div>
              </ng-template>
            </div>

            <div class="sm:col-span-1.5" [class.opacity-50]="!form.get('vehicleId')?.value">
              <label class="block text-sm font-medium text-gray-700">KM Atual</label>
              <input type="number" formControlName="currentKm" class="mt-1 border border-gray-300 py-2 px-3 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md">
            </div>
            <div class="sm:col-span-1.5" [class.opacity-50]="!form.get('vehicleId')?.value">
              <label class="block text-sm font-medium text-gray-700">Litros</label>
              <input type="number" formControlName="liters" class="mt-1 border border-gray-300 py-2 px-3 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md">
            </div>
          </div>
        </div>

        <!-- Material / Outros Fields -->
        <div *ngIf="form.get('type')?.value === 'MATERIAL' || form.get('type')?.value === 'OUTROS'" class="bg-gray-50 p-3 sm:p-4 rounded-md mb-6 border border-gray-200">
           <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-4">Itens da Requisição</h3>
           <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Obra / Local de Destino</label>
              <input type="text" formControlName="destinationWork" class="mt-1 border border-gray-300 py-2 px-3 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm rounded-md">
           </div>
           
           <div formArrayName="items">
             <div *ngFor="let item of items.controls; let i=index" [formGroupName]="i" class="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 mb-4 pb-4 border-b border-gray-200 sm:border-b-0 sm:pb-0">
               <div class="flex-1">
                 <label class="block text-xs font-medium text-gray-700">Descrição / Item</label>
                 <input type="text" formControlName="material" class="mt-1 border border-gray-300 py-2 px-3 block w-full shadow-sm sm:text-sm rounded-md">
               </div>
               <div class="grid grid-cols-3 gap-3 sm:contents">
                 <div class="sm:w-24">
                   <label class="block text-xs font-medium text-gray-700">Unidade</label>
                   <input type="text" formControlName="unit" class="mt-1 border border-gray-300 py-2 px-3 block w-full shadow-sm sm:text-sm rounded-md">
                 </div>
                 <div class="sm:w-24">
                   <label class="block text-xs font-medium text-gray-700">Qtd</label>
                   <input type="number" formControlName="quantity" class="mt-1 border border-gray-300 py-2 px-3 block w-full shadow-sm sm:text-sm rounded-md">
                 </div>
                 <div class="sm:w-32">
                   <label class="block text-xs font-medium text-gray-700">Custo Unit. (MT)</label>
                   <input type="number" formControlName="unitCost" class="mt-1 border border-gray-300 py-2 px-3 block w-full shadow-sm sm:text-sm rounded-md">
                 </div>
               </div>
               <div class="flex items-center justify-between sm:contents">
                 <div class="sm:w-32">
                   <label class="block text-xs font-medium text-gray-700 sm:block hidden">Total</label>
                   <div class="mt-1 py-2 px-3 bg-gray-200 border border-gray-300 rounded-md text-sm text-gray-800 font-semibold">
                     {{ (item.get('quantity')?.value * item.get('unitCost')?.value) || 0 | currency:'MZN':'symbol-narrow' }}
                   </div>
                 </div>
                 <div>
                   <button type="button" (click)="removeItem(i)" class="sm:mb-1 p-2 text-red-600 hover:text-red-800 bg-red-50 rounded-md">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                   </button>
                 </div>
               </div>
             </div>
           </div>
           
           <button type="button" (click)="addItem()" class="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center sm:justify-start">
             + Adicionar Item
           </button>
           
           <div class="mt-6 border-t pt-4 flex justify-end">
             <div class="text-right">
               <span class="text-sm text-gray-500">Total da Requisição:</span>
               <span class="ml-2 text-lg sm:text-xl font-bold text-gray-900">{{ calculateMaterialTotal() | currency:'MZN':'symbol-narrow' }}</span>
             </div>
           </div>
        </div>

        <div class="flex flex-col-reverse sm:flex-row sm:justify-end pt-5 border-t border-gray-200 gap-3">
          <button type="button" routerLink="/requisitions" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto text-center">
            Cancelar
          </button>
          <button type="submit" [disabled]="form.invalid || kmError || submitting()" class="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 w-full sm:w-auto">
            {{ submitting() ? 'A submeter...' : 'Submeter Requisição' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class RequisitionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reqService = inject(RequisitionService);
  private authService = inject(AuthService);
  private viaturaService = inject(ViaturaService);
  private router = inject(Router);

  form: FormGroup;
  viaturas: Viatura[] = [];
  selectedViatura?: Viatura;
  kmError: string | null = null;

  constructor() {
    this.form = this.fb.group({
      type: ['MATERIAL', Validators.required],
      
      // Combustivel
      vehicleId: [''],
      currentKm: [''],
      liters: [''],
      
      // Material
      destinationWork: [''],
      items: this.fb.array([])
    });
    
    this.addItem();
  }

  async ngOnInit() {
    try {
      this.viaturas = await this.viaturaService.getViaturasAtivas();
    } catch (e) {
      console.error('Erro ao carregar viaturas:', e);
    }
    
    this.form.get('type')?.valueChanges.subscribe(type => {
      if (type === 'MATERIAL' || type === 'OUTROS') {
        this.form.get('destinationWork')?.enable();
        this.form.get('items')?.enable();
        this.form.get('vehicleId')?.disable();
        this.form.get('currentKm')?.disable();
        this.form.get('liters')?.disable();
      } else {
        this.form.get('destinationWork')?.disable();
        this.form.get('items')?.disable();
        this.form.get('vehicleId')?.enable();
        this.form.get('vehicleId')?.setValidators([Validators.required]);
        this.form.get('currentKm')?.enable();
        this.form.get('currentKm')?.setValidators([Validators.required, Validators.min(0)]);
        this.form.get('liters')?.enable();
        this.form.get('liters')?.setValidators([Validators.required, Validators.min(1)]);
      }
      
      this.form.get('destinationWork')?.updateValueAndValidity();
      this.form.get('vehicleId')?.updateValueAndValidity();
      this.form.get('currentKm')?.updateValueAndValidity();
      this.form.get('liters')?.updateValueAndValidity();
    });

    // Trigger initial state setup
    this.form.get('destinationWork')?.setValidators([Validators.required]);
    this.form.get('type')?.setValue('MATERIAL', { emitEvent: true });

    this.form.get('vehicleId')?.valueChanges.subscribe(id => {
      this.selectedViatura = this.viaturas.find(v => v.id === id);
    });
  }

  get items() {
    return this.form.get('items') as FormArray;
  }

  addItem() {
    const itemGroup = this.fb.group({
      material: ['', Validators.required],
      unit: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitCost: [0, [Validators.required, Validators.min(0)]]
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    if (this.items.length === 0) {
      this.addItem();
    }
  }

  calculateMaterialTotal(): number {
    let total = 0;
    this.items.controls.forEach(control => {
      const q = control.get('quantity')?.value || 0;
      const c = control.get('unitCost')?.value || 0;
      total += q * c;
    });
    return total;
  }


  submitting = signal(false);

  async onSubmit() {
    if (this.form.invalid || this.kmError) return;

    const user = this.authService.currentUserValue;
    if (!user) return;

    this.submitting.set(true);

    const type = this.form.get('type')?.value;
    let totalValue = 0;
    
    if (type === 'MATERIAL' || type === 'OUTROS') {
      totalValue = this.calculateMaterialTotal();
    } else {
      totalValue = (this.form.get('liters')?.value || 0) * 85; 
    }

    try {
      await this.reqService.addRequisition({
        type: type,
        requesterId: user.id,
        date: new Date(),
        status: user.role === 'ADMINISTRACAO' ? RequisitionStatus.PENDENTE_PCA : RequisitionStatus.PENDENTE_ADMIN,
        totalValue: totalValue,
        destinationWork: this.form.get('destinationWork')?.value,
        items: (type === 'MATERIAL' || type === 'OUTROS') ? this.items.value.map((it: any) => ({
          ...it,
          total: it.quantity * it.unitCost
        })) : undefined,
        vehicleId: this.form.get('vehicleId')?.value || undefined,
        currentKm: this.form.get('currentKm')?.value || undefined,
        liters: this.form.get('liters')?.value || undefined
      });
      this.router.navigate(['/requisitions']);
    } catch (e: any) {
      alert('Erro ao submeter requisição: ' + e.message);
    } finally {
      this.submitting.set(false);
    }
  }
}

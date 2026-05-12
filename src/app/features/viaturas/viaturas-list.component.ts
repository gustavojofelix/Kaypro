import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViaturaService } from '../../core/services/viatura.service';
import { Viatura } from '../../core/models';

@Component({
  selector: 'app-viaturas-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Gestão de Frota</h2>
        <p class="text-gray-500 mt-1">Gerencie as viaturas da organização para requisições de combustível</p>
      </div>
      <button
        (click)="openModal()"
        class="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 active:scale-95 transition-all duration-150">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Adicionar Viatura
      </button>
    </div>

    <!-- Loading State -->
    <div *ngIf="loading()" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div *ngIf="!loading() && viaturas().length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
      <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">Nenhuma viatura cadastrada</h3>
      <p class="text-gray-500 mb-6">Cadastre a primeira viatura para que todos possam realizar requisições.</p>
      <button
        (click)="openModal()"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
        Cadastrar primeira viatura
      </button>
    </div>

    <!-- Table -->
    <div *ngIf="!loading() && viaturas().length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Marca</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Matrícula</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Cadastro</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr *ngFor="let v of viaturas()" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ v.marca }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">{{ v.matricula }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ v.created_at | date:'dd/MM/yyyy' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span [class]="v.ativa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {{ v.ativa ? 'Ativa' : 'Inativa' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button (click)="editViatura(v)" class="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md transition-colors" title="Editar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button (click)="toggleStatus(v)" 
                        [class]="v.ativa ? 'text-amber-600 hover:text-amber-900 bg-amber-50' : 'text-green-600 hover:text-green-900 bg-green-50'"
                        class="p-1.5 rounded-md transition-colors" 
                        [title]="v.ativa ? 'Desativar' : 'Ativar'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                </button>
                <button (click)="deleteViatura(v)" class="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md transition-colors" title="Eliminar">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in zoom-in duration-200">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h3 class="text-lg font-bold text-gray-900">{{ isEditing() ? 'Editar Viatura' : 'Adicionar Nova Viatura' }}</h3>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form (ngSubmit)="saveViatura()" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Marca da Viatura <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="form.marca" name="marca" required
                   placeholder="Ex: Toyota, Nissan, Mercedes..."
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Matrícula <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="form.matricula" name="matricula" required
                   placeholder="Ex: AAA-1234-MP"
                   (input)="onMatriculaInput($event)"
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 font-mono">
            <p class="mt-1.5 text-xs text-gray-500">Formato: XXX-####-XX</p>
          </div>

          <div class="flex items-center justify-between pt-2">
            <span class="text-sm font-medium text-gray-700">Viatura Ativa</span>
            <button type="button" (click)="form.ativa = !form.ativa"
                    [class]="form.ativa ? 'bg-blue-600' : 'bg-gray-200'"
                    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
              <span [class]="form.ativa ? 'translate-x-5' : 'translate-x-0'"
                    class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
          </div>

          <div *ngIf="error()" class="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
            {{ error() }}
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" (click)="closeModal()"
                    class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" [disabled]="submitting()"
                    class="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all active:scale-95">
              {{ submitting() ? 'Salvando...' : 'Salvar Viatura' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ViaturaListComponent implements OnInit {
  private viaturaService = inject(ViaturaService);

  viaturas = signal<Viatura[]>([]);
  loading = signal(true);
  showModal = signal(false);
  isEditing = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  form = {
    id: '',
    marca: '',
    matricula: '',
    ativa: true
  };

  ngOnInit() {
    this.loadViaturas();
  }

  async loadViaturas() {
    this.loading.set(true);
    try {
      this.viaturas.set(await this.viaturaService.getMinhasViaturas());
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  openModal() {
    this.isEditing.set(false);
    this.error.set(null);
    this.form = { id: '', marca: '', matricula: '', ativa: true };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onMatriculaInput(event: any) {
    let val = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Auto-format: AAA-1234-XX
    if (val.length > 3 && val.length <= 7) {
      val = val.substring(0, 3) + '-' + val.substring(3);
    } else if (val.length > 7) {
      val = val.substring(0, 3) + '-' + val.substring(3, 7) + '-' + val.substring(7, 9);
    }
    
    this.form.matricula = val.substring(0, 11);
  }

  editViatura(v: Viatura) {
    this.isEditing.set(true);
    this.error.set(null);
    this.form = { ...v };
    this.showModal.set(true);
  }

  async saveViatura() {
    if (!this.form.marca || this.form.marca.length < 2) {
      this.error.set('A marca deve ter pelo menos 2 caracteres.');
      return;
    }

    const matriculaRegex = /^[A-Z]{3}-\d{4}-[A-Z]{2}$/;
    if (!matriculaRegex.test(this.form.matricula)) {
      this.error.set('Formato de matrícula inválido (Ex: ABC-1234-XY).');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    try {
      // Check duplicate
      const exists = await this.viaturaService.checkMatriculaExistente(this.form.matricula, this.isEditing() ? this.form.id : undefined);
      if (exists) {
        this.error.set('Esta matrícula já está cadastrada no sistema.');
        return;
      }

      if (this.isEditing()) {
        await this.viaturaService.atualizarViatura(this.form.id, {
          marca: this.form.marca,
          matricula: this.form.matricula,
          ativa: this.form.ativa
        });
      } else {
        await this.viaturaService.cadastrarViatura({
          marca: this.form.marca,
          matricula: this.form.matricula,
          ativa: this.form.ativa
        });
      }

      this.loadViaturas();
      this.closeModal();
      alert(this.isEditing() ? 'Viatura atualizada com sucesso!' : 'Viatura cadastrada com sucesso!');
    } catch (e: any) {
      this.error.set(e.message || 'Ocorreu um erro ao salvar a viatura.');
    } finally {
      this.submitting.set(false);
    }
  }

  async toggleStatus(v: Viatura) {
    try {
      await this.viaturaService.atualizarViatura(v.id, { ativa: !v.ativa });
      this.loadViaturas();
    } catch (e) {
      console.error(e);
    }
  }

  async deleteViatura(v: Viatura) {
    if (confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
      try {
        await this.viaturaService.excluirViatura(v.id);
        this.loadViaturas();
      } catch (e: any) {
        if (e.code === '23503') {
          alert('Não é possível excluir esta viatura pois existem requisições vinculadas a ela. Sugerimos desativá-la em vez disso.');
        } else {
          alert('Erro ao excluir viatura.');
        }
      }
    }
  }
}

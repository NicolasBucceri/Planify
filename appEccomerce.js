const appEccomerce = new Vue({
    el: '#appEccomerce',
    data: {
        name: '',
        tareas: [],
        tareasTerminadas: [],
        filteredTareas: [],
        filteredTareasTerminadas: [],
        search: '',
        editTaskId: null,
        editedName: '',
        tareaBuscadaIndex: -1,
        searchResults: [],
        highlightedTaskId: null,
        showAlert: false
    },
    
    created() {
        fetch('tareas.json')
            .then(response => response.json())
            .then(json => {
                this.tareas = json.filter(t => !t.terminada);
                this.tareasTerminadas = json.filter(t => t.terminada);
                this.filteredTareas = this.tareas.slice();
                this.filteredTareasTerminadas = this.tareasTerminadas.slice();
            })
            .catch(error => {
                console.error('Error al cargar las tareas:', error);
            });
    },

    methods: {
        addTarea() {
            if (this.name.trim() === '') {
                this.showAlert = true;
                setTimeout(() => this.showAlert = false, 3000);
                return;
            }

            const newId = Date.now();
            this.tareas.push({
                id: newId,
                name: this.name.trim(),
                terminada: false
            });
            this.name = '';
            this.performSearch();
        },
        
        editarTarea(tareaId, esTerminada = false) {
            this.editTaskId = tareaId;
            if (esTerminada) {
                const tarea = this.tareasTerminadas.find(t => t.id === tareaId);
                if (tarea) {
                    this.editedName = tarea.name;
                }
            } else {
                const tarea = this.tareas.find(t => t.id === tareaId);
                if (tarea) {
                    this.editedName = tarea.name;
                }
            }
        },

        guardarEdicion() {
            if (this.editedName.trim() === '') {
                alert('El nombre editado no puede estar vacío.');
                return;
            }

            if (this.editTaskId) {
                const tareaTerminadaIndex = this.tareasTerminadas.findIndex(t => t.id === this.editTaskId);
                const tareaPendienteIndex = this.tareas.findIndex(t => t.id === this.editTaskId);
                
                if (tareaTerminadaIndex !== -1) {
                    this.tareasTerminadas[tareaTerminadaIndex].name = this.editedName.trim();
                } else if (tareaPendienteIndex !== -1) {
                    this.tareas[tareaPendienteIndex].name = this.editedName.trim();
                }
                
                this.cancelarEdicion();
            }    
        },
        
        cancelarEdicion() {
            this.editTaskId = null;
            this.editedName = '';
        },
        
        deleteTarea(index) {
            this.tareas.splice(index, 1);
            this.performSearch();
        },

        deleteTareaTerminada(index) {
            this.tareasTerminadas.splice(index, 1);
            this.performSearch();
        },
        
        toggleTarea(index) {
            let tarea;
            if (index < this.tareas.length) {
                tarea = this.tareas.splice(index, 1)[0];
                tarea.terminada = true;
                this.tareasTerminadas.push(tarea);
            } else {
                tarea = this.tareasTerminadas.splice(index - this.tareas.length, 1)[0];
                tarea.terminada = false;
                this.tareas.push(tarea);
            }
            this.tareaBuscadaIndex = -1;
            this.performSearch();
        },
        
        performSearch() {
            const searchLower = this.search.toLowerCase();
            
            if (searchLower.trim() === "") {
                this.searchResults = [];
                this.highlightedTaskId = null;
            } else {
                this.searchResults = this.tareas.concat(this.tareasTerminadas).filter(tarea => 
                    tarea.name.toLowerCase().includes(searchLower)
                );
            }
        },
        
        mostrarDetalle(tareaId) {
            const index = this.tareasTerminadas.findIndex(t => t.id === tareaId);
            if (index !== -1) {
                const tarea = this.tareasTerminadas[index];
                tarea.terminada = false; 
                this.tareasTerminadas.splice(index, 1); 
                this.tareas.push(tarea); 
            }
            this.performSearch(); 
        },

        goToTask(tareaId) {
            this.tareaBuscadaIndex = this.tareas.findIndex(t => t.id === tareaId);
            if (this.tareaBuscadaIndex === -1) {
                this.tareaBuscadaIndex = this.tareasTerminadas.findIndex(t => t.id === tareaId);
            }
        
            this.highlightedTaskId = tareaId; 
            console.log('Tarea resaltada ID:', this.highlightedTaskId);
        
            this.searchResults = [];
        }
    },

    computed: {
        cantPendientes() {
            return this.tareas.length;
        },
        cantTerminadas() {
            return this.tareasTerminadas.length;
        }
    }
});

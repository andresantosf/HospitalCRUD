const openPopup = (popup) => {
    document.getElementById(popup).classList.add('active');
}

const closePopup = () => {
    erro = document.querySelector('#error')
    if(document.querySelector('#error') != null){
        erro.innerHTML = ``
    }
    popup = document.querySelector('.active')
    popup.classList.remove('active');
    if(popup.id == 'popupRegister'){
        clearFields()
    }
}

const getItemInLocalStorage = (item) => {
    return JSON.parse(localStorage.getItem(item)) ?? []
}

const dbPatient = getItemInLocalStorage("FichaPaciente")

const setItemInLocalStorage = (tableName, item) => {
    return localStorage.setItem(tableName, JSON.stringify(item))
}

const getInputValue = (element) => {
    return document.getElementById(element).value
}

const planos = {
    p1: 'Plano 1', 
    p2: 'Plano 2',
    p3: 'Plano 3'
}

const especialidades = {
    esp1: 'Especialidade 1',
    esp2: 'Especialidade 2',
    esp3: 'Especialidade 3'
}

setItemInLocalStorage('PlanosDeSaude', planos)
setItemInLocalStorage('Especialidades', especialidades)

const savePatient = () => {
    if(isValidFields()) {
        const index = document.getElementById('nome').dataset.index
        const dbPatientexist = (dbPatient != undefined && dbPatient.length != 0) 
        if(index == 'new'){
            if(dbPatientexist){
                id = dbPatient[dbPatient.length - 1].id + 1
            }else{
                id = 0
            }
        }else{
            id = parseInt(index)
        }

        const patient = {
            id: id,
            NomePaciente: getInputValue('nome').trim(),
            NumeroCarteiraPlano: getInputValue('carteira').trim(),
            IdPlanoDeSaude: getInputValue('plano'),
            IdEspecialidade: getInputValue('especialidade'),
        }

        if(dbPatientexist){
            for(i = 0; i < dbPatient.length; i++){
                if(dbPatient[i].NomePaciente == patient.NomePaciente && dbPatient[i].IdEspecialidade == patient.IdEspecialidade && dbPatient[i].IdPlanoDeSaude == patient.IdPlanoDeSaude){
                    modal = document.getElementsByClassName('modal-content');
                    plano = getItemInLocalStorage('PlanosDeSaude')
                    esp = getItemInLocalStorage('Especialidades')
                    
                    form = document.querySelector('.popup-form')
                    if(document.querySelector('#error') == null){
                        form.innerHTML += `<p id="error">Esta especialidade <b>"${esp[dbPatient[i].IdEspecialidade]}"</b> já foi utiliza no plano <b>"${plano[dbPatient[i].IdPlanoDeSaude]}"</b> para o paciente <b>"${dbPatient[i].NomePaciente}"</b><p>`
                    }else{
                        p = document.querySelector('#error')
                        p.innerHTML = `Esta especialidade <b>"${esp[dbPatient[i].IdEspecialidade]}"</b> já foi utiliza no plano <b>"${plano[dbPatient[i].IdPlanoDeSaude]}"</b> para o paciente <b>"${dbPatient[i].NomePaciente}"</b>`
                    }
                    return;
                }
            }
        }

        if(index == 'new'){
            registerPatient(patient)
            updateTable()
            closePopup()
        }else {
            updatePatient(index, patient) //Para caso a função tenha sido chamada para editar um paciente já existente.
            updateTableWithFilter(dbPatient, index)
            closePopup()
        }
    }
}

getIndex = (index) => {
    dbPatient.forEach(patientObj => {
        if(Object.values(patientObj)[0] == index){
            i = dbPatient.indexOf(patientObj)
        }
    });
    return i;
}

// Paciente
const isValidFields = () => {
    return document.getElementById('form').reportValidity()
}

const registerPatient = (patient) => {
    dbPatient.push(patient)
    setItemInLocalStorage("FichaPaciente", dbPatient)
}

const updatePatient = (index, client) => {
    i = getIndex(index)
    dbPatient[i] = client
    setItemInLocalStorage("FichaPaciente", dbPatient)
}

const deletePatient = (index) => {
    i = getIndex(index)
    dbPatient.splice(i, 1)
    setItemInLocalStorage("FichaPaciente", dbPatient)
    updateTable()
} 

const editPatient = (index) => {
    var patient
    dbPatient.forEach(patientObj => {
        if(Object.values(patientObj)[0] == index){
            patient = patientObj
        }
    });
    patient.index = index
    fillFields(patient)
    openPopup('popupRegister')
}

const fillFields = (patient) => {
    document.getElementById('nome').value = patient.NomePaciente
    document.getElementById('carteira').value = patient.NumeroCarteiraPlano
    document.getElementById('especialidade').value = patient.IdEspecialidade
    document.getElementById('plano').value = patient.IdPlanoDeSaude
    document.getElementById('nome').dataset.index = patient.index
}

const editOrDelete = (event) => {
    if(event.target.type == 'button' || event.target.innerHTML == 'edit' || event.target.innerHTML == 'close'){
        var action, index
        if( event.target.innerHTML == 'edit' || event.target.innerHTML == 'close'){
            var[action, index] = event.target.parentNode.id.split('-')
        }else{
            var[action, index] = event.target.id.split('-')
        }
        if(action == 'edit'){
            editPatient(index)
        }else{
            deletePatient(index)
            updateTable()
        }
    }
}

// Filtro
const filterPatients = () => {
    nome = document.getElementById('nomeFilter').value
    carteira = document.getElementById('carteiraFilter').value
    especialidade = document.getElementById('especialidadeFilter').value
    plano = document.getElementById('planoFilter').value

    const patientFiltered = dbPatient.filter(paciente => {
        return((paciente.NomePaciente.includes(nome) || nome.length == 0)
        && (paciente.NumeroCarteiraPlano.includes(carteira)  || carteira.length==0)
        && (paciente.IdEspecialidade.includes(especialidade) || especialidade.length==0)  
        && (paciente.IdPlanoDeSaude.includes(plano)  || plano.length==0))
    })

    updateTableWithFilter(patientFiltered)
    closePopup()
}

const clearFields = () => {
    const fields = document.querySelectorAll('.popup-field')
    fields.forEach(field => field.value = "")
    document.getElementById('nome').dataset.index = 'new'
}

const resetFilters = () => {
    updateTable()
    clearFields()
    closePopup()
}

// Tabela
const updateTable = (patients) => {
    if(patients == undefined){
        patients = getItemInLocalStorage("FichaPaciente")
    }
    clearTable()//Limpa a tabela
    patients.forEach(createRow)//Reconstroi a tabela
}

const updateTableWithFilter = (patients) => {
    clearTable()//Limpa a tabela
    patients.forEach( patient => createRowFiltred(patient))//Reconstroi a tabela
}

const clearTable = () => {
    const rows = document.querySelectorAll('#tableClient>tbody tr')
    rows.forEach(row => row.parentNode.removeChild(row))
}

const createRow = (client, index) => {
    const newRow = document.createElement('tr')
    plano = getItemInLocalStorage("PlanosDeSaude")
    esp = getItemInLocalStorage("Especialidades")
    newRow.innerHTML = `
        <td>${client.NomePaciente}</td>
        <td>${client.NumeroCarteiraPlano}</td>
        <td>${esp[`${client.IdEspecialidade}`]}</td>
        <td>${plano[`${client.IdPlanoDeSaude}`]}</td>
        <td>
            <button type="button" class="button green" id="edit-${client.id}"><i class="material-icons">edit</i></button>
            <button type="button" class="button red" id="delete-${client.id}"><i class="material-icons">close</i></button>
        </td>
    `
    document.querySelector('#tableClient>tbody').appendChild(newRow)
}

const createRowFiltred = (client) => {
    const newRow = document.createElement('tr')
    plano = getItemInLocalStorage("PlanosDeSaude")
    esp = getItemInLocalStorage("Especialidades")

    newRow.innerHTML = `
        <td>${client.NomePaciente}</td>
        <td>${client.NumeroCarteiraPlano}</td>
        <td>${esp[`${client.IdEspecialidade}`]}</td>
        <td>${plano[`${client.IdPlanoDeSaude}`]}</td>
        <td>
            <button type="button" class="button green" id="edit-${client.id}"><i class="material-icons">edit</i></button>
            <button type="button" class="button red" id="delete-${client.id}"><i class="material-icons">close</i></button>
        </td>
    `
    document.querySelector('#tableClient>tbody').appendChild(newRow)
}

updateTable()

addEventClick = (id, action) => {
    document.getElementById(id).addEventListener('click', action);
}

addEventClick('pacientRegister', () => {openPopup('popupRegister')})
addEventClick('salvar', savePatient)
addEventClick('reset', resetFilters)
addEventClick('filterPopup', () => {openPopup('popupFilter')})
addEventClick('filter', filterPatients)

document.querySelector('#tableClient>tbody').addEventListener('click', editOrDelete)

document.querySelectorAll('.popup-close').forEach(element =>{
    element.addEventListener('click', closePopup)
})

document.querySelectorAll('.cancelar').forEach(element =>{
    element.addEventListener('click', closePopup)
})


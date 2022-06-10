class Model {
  #tags
  #selectedTags

  constructor() {
    this.#tags = ['engineering', 'sales', 'marketing', 'friend'];
    this.#selectedTags = [];
  }

  async updateContact(contact) {
    let init = this.createInit(contact, 'PUT');
    let req = await fetch(`http://localhost:3000/api/contacts/${contact.id}`, init);
    let res = await req;

    if (res.status === 201) {
      alert(`Contact ${contact.full_name} has been updated!`);
    } else {
      alert('Contact could not be updated, please try again');
    }
  }

  async addContact(contact) {
    let init = this.createInit(contact, 'POST');

    let req = await fetch('http://localhost:3000/api/contacts/', init);
    if (req.status === 201) {
      alert(`Contact ${contact.full_name} added!`)
    } else {
      alert('Please try again');
    }
  }

  async deleteContact(id) {
    let req = await fetch(`http://localhost:3000/api/contacts/${id}`,
                           {method: 'DELETE'});
    if (req.status === 204) {
      alert('Contact Deleted!');
    } else {
      alert('Error: Please try again')
    }
  }

  async getAllContacts() {
    let req = await fetch('http://localhost:3000/api/contacts');

    let object = await req.json();
    return await object;
  }

  createInit(data, method) {
    return {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    }
  }

  getTags() {
    return this.#tags.slice();
  }

  addTag(tagName) {
    this.#tags.push(tagName);
  }

  submitTags(model) {
    $('.checkBoxGrp input').each(function() {
      if (this.checked) {
        model.#selectedTags.push(this.id.toLowerCase());
      }
    });
  }

  getSelectedTags() {
    return this.#selectedTags
  }

  resetTags() {
    this.#tags = []
    this.#selectedTags = [];
  }
}

class View {
  constructor() {
    this.displayAddContact();
    this.searchListener();
    this.tagAnchorListener();
  }

  // listen for tag being clicked
  tagAnchorListener() {
    $(document).on('click', e => {
      if (e.target.tagName === 'A') {
        e.preventDefault();
        let tagName = e.target.innerText;
        this.displayByTag(tagName);
      }
    });
  }

  editBtnListener(handler) {
    $(document).on('click', e => {
      if (e.target.className === 'editBtn') {
        document.querySelector('.formHeader').textContent = 'Edit Contact';
        handler(e);
      }
    });
  }

  deleteBtnListener(handler) {
    $(document).on('click', e => {
      if (e.target.className === 'deleteBtn') {
        handler(e);
      }
    });
  }

  addTagListener(handler) {
    $('.addTagBtn').on('click', e => {
      e.preventDefault();
      let value = document.querySelector('#chooseTag').value.trim();
      handler(value);
    });
  }

  clearTagIconListener(handler) {
    $(document).on('click', e => {
      if (Array.from(e.target.classList).includes('clearTagBtn')) {
        e.preventDefault();
        handler();
      }
    });
  }

  submitBtnListener(handler) {
    $('form').on('submit', e => {
      e.preventDefault();
      let name = $('#name')[0]
      let email = $('#email')[0]
      let phone = $('#phone')[0]
      handler(name, email, phone);
    })
  }

  cancelBtnListener(handler) {
    $('#cancel').on('click', e => {
      e.preventDefault();
      handler();
    });
  }

  searchListener() {
    $('#search').on('input', e => {
      let value = e.target.value;
      let names = Array.from(document.querySelectorAll('.contactContainer h3'));
      value = value.toLowerCase();

      names.forEach(ele => {
        let parent = ele.parentNode;
        let lowSlice = ele.innerText.slice(0, value.length).toLowerCase();
        let upSlice = ele.innerText.slice(0, value.length).toUpperCase();
        if (value === lowSlice || value === upSlice) {
          parent.style.display = 'inline-block';
        } else {
          parent.style.display = 'none';
        }
      });
    });
  }

  displayByTag(tagName) {
    this.createAllContactsBtn();
    let contacts = Array.from(document.querySelectorAll('.contacts'));
    contacts.filter(ele => {
      let tagArr = Array.from(ele.querySelectorAll('a')).map(a => a.innerText);
      if (tagArr.includes(tagName)) {
        ele.style.display = 'inline-block'
      } else {
        ele.style.display = 'none';
      }
    });
  }

  displayAddContact() {
    $(document).on('click', e => {
      if (Array.from(e.target.classList).includes('addButtons')) {
        document.querySelector('#name').removeAttribute('disabled');
        document.querySelector('.formHeader').textContent = 'Create Contact';
        e.preventDefault();
        this.toggleAddContact();
      }
    })
  }

  displayAllContacts() {
    $('.contacts').each(function() {
      this.style.display = 'inline-block';
    });
  }

  displayError(eleArr) {
    eleArr.forEach(ele => {
      ele.parentNode.querySelector('p')
                             .style.display = 'block';

      ele.style.borderColor = 'red';

      ele.parentNode.querySelector('label').style.color = 'red';
    });
  }

  removeDisplayTags() {
    $('.checkBoxGrp input').each(function() {
      this.checked = false;
      if (!['engineering', 'sales', 'marketing', 'friend'].includes(this.id)) {
        this.parentNode.removeChild(document.querySelector(`label[for=${this.id}]`));
        this.parentNode.removeChild(this);
      }
    });
  }

  async buildScript(url, contact) {
    let template = await fetch(url);
    let tempScript = Handlebars.compile(await template.text());
    return await tempScript(contact);
  }

  async buildContact(contactArr) {
    contactArr.forEach(contact => {
      (async () => {
        let html = await this.buildScript('templates/createContact.hbs', contact);
        $('.contactContainer').append(html);
      })();
    });
  }

  createAllContactsBtn() {
    if (!document.querySelector('.allContactsContainer')) {
      let script = ("<div class=allContactsContainer>\
                    <a href='/' class='clearTagBtn'><i class='fa-solid\
                    fa-circle-arrow-left clearTagBtn'></i>Clear tag filter</a>");
      let template = Handlebars.compile(script);
      $('.contactContainer').prepend(template);
    }
  }

  createTag(tagName) {
    tagName = tagName[0].toUpperCase() + tagName.slice(1);
    let nameArr = tagName.split(' ');
    tagName = nameArr.length >= 2 ? nameArr.join('') : tagName;
    let script = '<div><input id="{{tagName}}" type="checkbox" checked="true"></input>\
      <label for="{{tagName}}">{{tagName}}</label></div>'

    let html = Handlebars.compile(script)({tagName});
    $('.checkBoxGrp').append(html);

    this.resetTagInput();
  }

  resetInputBoxesBorder() {
    $('.formInput').each(function() {
      this.parentNode.querySelector('p').style.display = 'none';
      this.style.borderColor = '#ccc';
      this.parentNode.querySelector('label').style.color = 'black';
    });
  }

  resetInputBoxesValue() {
    $('.formInput').each(function() {
      this.value = '';
    });
  }

  resetTagInput() {
    $('#chooseTag')[0].value = '';
  }

  prefillEditForm(contactObj) {
    let {full_name, phone_number, email, tags} = contactObj;
    document.querySelector('#name').value = full_name;
    document.querySelector('#name').setAttribute('disabled', 'true');
    document.querySelector('#phone').value = phone_number;
    document.querySelector('#email').value = email;
  }

  selectTags(tagsArr) {
    if (!tagsArr) return;

    tagsArr.forEach(ele => {
      if (['engineering', 'sales', 'marketing', 'friend'].includes(ele)) {
        document.querySelector(`#${ele}`).checked = true;
      } else {
        this.createTag(ele);
      }
    });
  }

  removeContactContainer(ele) {
    document.querySelector('.contactContainer').removeChild(ele);
  }

  toggleAddContact() {
    $('#mainContainer').slideToggle(400);
    $('#createContactBox').slideToggle(400);
  }

  // show contact containers and hide no contact box
  toggleBoxes() {
    document.querySelector('.contactContainer').style.display = 'block';
    document.querySelector('#noContactBox').style.display = 'none';
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.view.submitBtnListener(this.submitBtnHandler);
    this.view.addTagListener(this.tagHandler);
    this.view.cancelBtnListener(this.resetForm);
    this.view.editBtnListener(this.editBtnHandler);
    this.view.deleteBtnListener(this.deleteHandler);
    this.view.clearTagIconListener(this.clearTagHandler);
    this.getBody();
  }

  clearTagHandler = () => {
    this.view.displayAllContacts()
    $('.allContactsContainer').remove();
  }

  editBtnHandler = async (event) => {
    let target = event.target.parentNode.parentNode;
    let name = target.querySelector('h3').innerText;
    let allContacts = await this.model.getAllContacts();
    let contactObj = allContacts.filter(({full_name}) => full_name === name)[0];
    this.view.prefillEditForm(contactObj);
    this.view.selectTags(contactObj.tags);
    this.view.toggleAddContact();
  }

  deleteHandler = async (event) => {
    let ele = event.target.parentNode.parentNode;
    let name = event.target.parentNode
                           .parentNode
                           .querySelector('h3')
                           .innerText;
    let id = (await this.getContact(name)).id;
    this.model.deleteContact(id);
    this.view.removeContactContainer(ele);

    if (this.numOfContacts() === 0) {
      document.querySelector('#noContactBox').style.display = 'block';
    }
  }

  submitBtnHandler = async (name, givenEmail, phone) => {
    this.model.submitTags(this.model);
    let t = this.model.getSelectedTags();
    let contact;

    if (this.formValidation(name, givenEmail, phone)) {
      this.view.toggleBoxes();
      if (await this.contactExist(name.value.trim())) {
        contact = await this.getContact(name.value)
        this.editContact(contact, givenEmail, phone, t);
      } else {
        contact = {
          'full_name': name.value.trim(),
          email: givenEmail.value.trim(),
          'phone_number': phone.value.trim(),
          tags: t,
        }

        this.model.addContact(contact);
        this.view.buildContact([contact]);
        this.resetForm();
      }
    } else {
      return;
    }
  }

  tagHandler = (tag) => {
    this.model.submitTags(this.model);
    tag = tag.toLowerCase();

    if (!tag) {
      alert('Tag not added! Please enter value');
    } else if (this.model.getSelectedTags().includes(tag)) {
      alert('That tag already exists, please try again');
      this.view.resetTagInput();
      this.model.resetTags();
    } else {
      this.view.createTag(tag)
      this.model.addTag(tag);
    }
  }

  numOfContacts() {
    return Array.from(document.querySelector('.contactContainer')
    .children)
    .length;
  }

  async getBody() {
    let contacts = await this.model.getAllContacts();
    this.view.buildContact(contacts);

    if (contacts.length >= 1) {
      document.querySelector('.contactContainer').style.display = 'block';
    } else {
      document.querySelector('#noContactBox').style.display = 'block';
    }
  }

  async updatedContactObj(oldContact, givenEmail, phone, t) {
    return {
      id: oldContact.id,
      full_name: oldContact['full_name'],
      email: givenEmail.value.trim(),
      phone_number: phone.value.trim(),
      tags: t,
    }
  }

  async contactExist(name) {
    let allContacts = await this.model.getAllContacts();
    let contactArr = allContacts.filter(obj => obj.full_name === name);
    return contactArr.length >= 1;
  }

  async getContact(name) {
    let allContacts = await this.model.getAllContacts();
    return allContacts.filter(obj => obj.full_name === name)[0];
  }

  async editContact(contact, givenEmail, phone, t) {
    let obj = await this.updatedContactObj(contact, givenEmail, phone, t);
    this.model.updateContact(obj);
    this.removeContacts();
    this.renderAllContacts();
    this.resetForm();
  }

  async renderAllContacts() {
    this.view.buildContact(await this.model.getAllContacts());
  }

  removeContacts() {
    document.querySelector('.contactContainer').innerHTML = '';
  }

  formValidation(...elements) {
    let invalidEle = elements.filter(ele => !ele.value.trim());

    if (invalidEle.length >= 1) {
      this.view.displayError(invalidEle);
      return false;
    } else {
      return true;
    }
  }

  validInputs(name, email, phone) {
    return name && email && phone;
  }

  resetForm = () => {
    this.view.resetInputBoxesValue();
    this.view.resetInputBoxesBorder();
    this.view.toggleAddContact();
    this.view.removeDisplayTags();
    this.model.resetTags();
  }
}

const app = new Controller(new Model(), new View());
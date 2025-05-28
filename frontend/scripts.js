// Поява вікна, де можна в майбутньому міняти пароль

const openPopUp = document.getElementById('open_pop_up');
const closePopUp = document.getElementById('pop_up_close');
const popUp = document.getElementById('pop_up');
const popUpBody = document.getElementById('pop_up_body')

openPopUp.addEventListener('click', function(e){
    e.preventDefault();
    popUp.classList.add('openwin');
})

closePopUp.addEventListener('click', () => {
    popUp.classList.remove('openwin');
})

//

// КОНСТАНТИ ДЛЯ КНОПОК ДЛЯ ЗМІНИ АВАТАРКИ

const imgAvatar = document.querySelector('avatar');
const inputAvatar = document.querySelector('avatarinput');
const changeAvatar = document.querySelector('change_avatar');
const deleteAvatar = document.querySelector('delete_avatar');

// ФУНКЦІОНАЛ ДЛЯ КНОПКИ ДЛЯ ОНОВЛЕННЯ АВАТАРКИ

changeAvatar.addEventListener('click', () =>{
    inputAvatar.click();
})

//
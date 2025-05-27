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

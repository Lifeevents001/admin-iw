function showContainer(id) {
  document.querySelectorAll('.container').forEach(c => c.classList.remove('active'));
  document.getElementById(`container${id}`).classList.add('active');
}

showContainer(1);



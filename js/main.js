function logout() {
    sessionStorage.clear();
}

function showAlert(title, content, buttons) {
    let modal = $('#alertmodal');
    // Update the modal's content.
    let modalTitle = $('.modal-title');
    let modalBody = $('.modal-body');
    let modalFooter = $('.modal-footer');

    modalTitle.text(title);
    modalBody.html('<p>' + content + '</p>');
    switch (buttons) {
        case 1:
            modalFooter.html('<button type="button" class="btn" data-bs-dismiss="modal">Close</button>');
            break;
        case 2:
            modalFooter.html('<button type="button" class="btn" data-bs-dismiss="modal">Cancel</button><button type="button" class="btn filled">Ok</button>');
            break;
    }

    modal.modal('show');
}
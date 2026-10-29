const API_URL = '/api';

function createEmptyItem() {
  return {
    id: '',
    title: '',
    description: '',
    done: false,
  };
}

module.exports = {
  API_URL,
  createEmptyItem,
};

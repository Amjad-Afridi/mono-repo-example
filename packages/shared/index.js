const API_URL = 'http://localhost:4000/api';

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

import React, { Component } from 'react';
import Searchbar from './Searchbar/Searchbar';
import ImageGallery from './ImageGallery/ImageGallery';
import Button from './Button/Button';
import LoaderSpinner from './Loader/Loader.js';
import Modal from './Modal/Modal';

class App extends Component {
  state = {
    query: '',
    images: [],
    page: 1,
    isLoading: false,
    showModal: false,
    selectedImage: null,
    prevQuery: '',
  };

  componentDidUpdate(_, prevState) {
    const { query, page, images } = this.state;
    if (prevState.query !== query || prevState.page !== page) {
      // Only fetch images if query or page has changed
      this.fetchImages();
    } else if (
      prevState.images.length !== images.length &&
      prevState.images.length !== 0
    ) {
      // Scroll to bottom if images have been updated and it's not the initial load
      this.scrollToBottom();
    }
  }

  handleSearch = query => {
    // check if the query is different from the previous query
    if (query !== this.state.prevQuery) {
      this.setState({ query, images: [], page: 1, prevQuery: query });
    }
  };

  fetchImages = async () => {
    const { query, page } = this.state;
    const perPage = 12;
    const apiKey = '39493730-2b7f664c84691fe9cb5103ec9';
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&pretty=true&page=${page}&per_page=${perPage}`;

    this.setState({ isLoading: true });

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      if (data.totalHits === 0) {
        throw new Error('No images found for the given query');
      }

      this.setState(prevState => ({
        images: [...prevState.images, ...data.hits],
      }));

      // add delay to
      setTimeout(() => {
        this.setState({ isLoading: false });
      }, 500);
    } catch (error) {
      console.error(error.message);
      this.setState({ isLoading: false });
    }
  };

  scrollToBottom = () => {
    let currentScrollPosition = window.scrollY;
    let targetScrollPosition = document.body.scrollHeight - window.innerHeight;
    let scrollStep = Math.round(
      (targetScrollPosition - currentScrollPosition) / 20
    );

    const smoothScroll = () => {
      currentScrollPosition += scrollStep;
      window.scrollTo(0, currentScrollPosition);

      if (currentScrollPosition < targetScrollPosition) {
        window.requestAnimationFrame(smoothScroll);
      }
    };

    window.requestAnimationFrame(smoothScroll);
  };

  handleLoadMore = () => {
    this.setState(prevState => ({ page: prevState.page + 1 }));
  };

  handleImageClick = image => {
    this.setState({ showModal: true, selectedImage: image });
  };

  closeModal = () => {
    this.setState({ showModal: false, selectedImage: null });
  };

  render() {
    const { images, isLoading, showModal, selectedImage } = this.state;

    return (
      <div className="App">
        <Searchbar onSubmit={this.handleSearch} />
        <ImageGallery images={images} onImageClick={this.handleImageClick} />
        {isLoading && <LoaderSpinner />}
        {images.length > 0 && !isLoading && (
          <Button onClick={this.handleLoadMore}>Load more</Button>
        )}
        {showModal && <Modal image={selectedImage} onClose={this.closeModal} />}
      </div>
    );
  }
}

export default App;

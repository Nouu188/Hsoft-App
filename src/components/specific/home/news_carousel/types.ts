export interface CarouselProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactElement;
  autoplay?: boolean;
  autoplayInterval?: number;
  showPagination?: boolean;
}
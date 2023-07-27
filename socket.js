module.exports = (io) => {
console.log("coming o");
    io.on('connection', socket => {
        console.log('new connection'); 
        

         socket.on("fetchMovies", () => {
            
      socket.emit("moviesData", { movies: [...yourMovieData] });
    });

		socket.on('disconnect', () => console.log('disconnected')); 
		
	})
}
The application is deployed at https://ims-app-g3ep.onrender.com

Database: test

Password: test


Sources I used for support:

General - https://github.com/C-McCarty/t2me/

Axios - https://www.freecodecamp.org/news/how-to-use-axios-with-react/

React Select component - https://www.youtube.com/watch?v=3u_ulMvTYZI

Exporting to CSV - https://dev.to/graciesharma/implementing-csv-data-export-in-react-without-external-libraries-3030

### Storage Process Explanation

Users can download a copy of the database via internet connection before making changes. All changes the user makes update the local working copy of the data instead of making direct updates to the database. This allows the user to work on the database without an internet connection and permits more than one user to act on the data simultaneously, though they must work on separate documents. The user requires an internet connection to publish their working changes to the database.
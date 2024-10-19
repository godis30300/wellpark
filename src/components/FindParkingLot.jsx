import { Grid, List, ListItem,ListItemIcon } from '@mui/material';
import IconToggle from './IconToggle.jsx';
import GoogleMap from './GoogleMap.jsx';


export default function FindParkingLot() {
    return (
        <>
        <Grid
            container
            direction="column"
            style={{ height: '99vh', width: '100%', padding: '1rem', boxSizing: 'border-box' }}
        >
            {/* Google Map，佔據剩餘空間 */}
            <Grid item style={{ flexGrow: 9, marginBottom: '0.5rem', }}>
                <GoogleMap />
            </Grid>

            {/* ListItem，位於 Google Map 底下 */}
            <Grid item style={{ height: 'auto' }}>
                <List style={{
                    display: 'flex',
                    flexDirection: 'row',
                    backgroundColor: 'black',
                    color: 'white',
                    borderRadius: '2rem',
                }}>
                    <ListItem
                        style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexGrow: 1,
                        }}
                    >
                        <ListItemIcon style={{ color: 'white', justifyContent: 'center' }}>
                        <IconToggle  iconType="lot" link="https://www.figma.com/proto/vMuqrJkA4BGod10z2kn0sQ/梅竹黑客松?page-id=1%3A24&node-id=63-3293&node-type=frame&viewport=284%2C228%2C0.54&t=MOhyOPdpBZPPfffj-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=41%3A389"/>
                        </ListItemIcon>
                    </ListItem>
                    <ListItem
                        style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexGrow: 1
                        }}
                    >
                        <ListItemIcon style={{ color: 'white', justifyContent: 'center' }}>
                        <IconToggle iconType="fee" />
                        </ListItemIcon>
                    </ListItem>
                    <ListItem
                        style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexGrow: 1
                        }}
                    >
                        <ListItemIcon style={{ color: 'white', justifyContent: 'center' }}>
                        <IconToggle iconType="list" />
                        </ListItemIcon>
                    </ListItem>
                    <ListItem
                        style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexGrow: 1,
                        }}
                    >
                        <ListItemIcon style={{ color: 'white', justifyContent: 'center' }}>
                        <IconToggle iconType="about" />
                        </ListItemIcon>
                    </ListItem>
                </List>
            </Grid>
        </Grid>
    </>
    );
}

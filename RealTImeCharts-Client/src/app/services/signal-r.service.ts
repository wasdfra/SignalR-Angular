import {Injectable} from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {HttpTransportType, LogLevel} from '@microsoft/signalr';
import {ChartModel} from '../_interfaces/chartmodel.model';



// You can create a factory which signalR will used to generate an access token on each request
// tslint:disable-next-line:max-line-length
const getBearerToken = () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJIb3NwaXRhbElEIjoiOWNhNzlhMjUtYzM5My00MmEzLWQ2M2QtMDhkOTM3YjQ3YjIwIiwiV2luZ0lEIjoiOWNhNzlhMjUtYzM5My00MmEzLWQ2M2QtMDhkOTM3YjQ3YjIwIiwic3ViIjoiMzVmMzEzNWUtMGIyOS00ZjY0LWI4ZDAtNWViNzRiNjkyYTViIiwibmFtZWlkIjoiMjk5OTk5OTk5IiwianRpIjoiZTk1ZjBiODMtZDhhOS00ODYxLTk2ZTUtYTQxMTEzMzMxOTczIiwibmJmIjoxNjI1NTg3ODQxLCJpYXQiOjE2MjU1ODc4NDEsInJvbGUiOiJNb2RlcmF0b3IiLCJleHAiOjE2MjU1OTUwNDEsImlzcyI6IkNPVklEVHJpYWdlIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3QifQ.noNVecZkYnQHCpGBCKA-mjHt-qk8HwMK0U63Kjj49F0'

// This is a custom method which creates all the headers I need for my authentication
const getAuthHeaders = () => ({ collection: '', of: '', headers: ''});

// As per @Brennan's answer I used his advice and extened the default one
class CustomHttpClient extends signalR.DefaultHttpClient {
  constructor() {
    // the base class wants an signalR.ILogger,
    // I'm not sure if you're supposed to put *the console* into it, but I did and it seemed to work
    super(console);
  }

  // So far I have only overriden this method, and all seems to work well
  public async send(request: signalR.HttpRequest): Promise<signalR.HttpResponse> {
    const authHeaders = getAuthHeaders(); // These are the extra headers I needed to put in
    request.headers = {
      'Authorization' : 'Bearer ' + getBearerToken()
    };
    // Now we have manipulated the request how we want we can just call the base class method
    return super.send(request);
  }
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  public data: ChartModel[];
  public bradcastedData: ChartModel[];

  private hubConnection: signalR.HubConnection;


  public startConnection = () => {

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:8448/api/WaitingList',
        // {
        // headers: {
        //     'Authorization' : 'Bearer ' + getBearerToken()
        //   },
        //   transport: HttpTransportType.WebSockets,
        //   withCredentials: true,
        //   accessTokenFactory: () => {
        //     console.log(this.data);
        //       return getBearerToken();
        //   }
        // }
        {
          httpClient: new CustomHttpClient()
        }
      )
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public addTransferChartDataListener = () => {
    this.hubConnection.on('transferchartdata', (data) => {
      this.data = data;
      console.log(data);
    });
  }

  public broadcastChartData = () => {
    this.hubConnection.invoke('broadcastchartdata', this.data)
    .catch(err => console.error(err));
  }

  public addBroadcastChartDataListener = () => {
    this.hubConnection.on('broadcastchartdata', (data) => {
      this.bradcastedData = data;
    });
  }
}

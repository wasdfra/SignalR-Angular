import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { ChartModel } from '../_interfaces/chartmodel.model';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  public data: ChartModel[];
  public bradcastedData: ChartModel[];

  private hubConnection: signalR.HubConnection;

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
                            .withUrl('https://localhost:8448/api/WaitingList', {
                              headers: {
                                // tslint:disable-next-line:max-line-length
                                'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJIb3NwaXRhbElEIjoiOWNhNzlhMjUtYzM5My00MmEzLWQ2M2QtMDhkOTM3YjQ3YjIwIiwiV2luZ0lEIjoiOWNhNzlhMjUtYzM5My00MmEzLWQ2M2QtMDhkOTM3YjQ3YjIwIiwic3ViIjoiMzVmMzEzNWUtMGIyOS00ZjY0LWI4ZDAtNWViNzRiNjkyYTViIiwibmFtZWlkIjoiMjk5OTk5OTk5IiwianRpIjoiZTk1ZjBiODMtZDhhOS00ODYxLTk2ZTUtYTQxMTEzMzMxOTczIiwibmJmIjoxNjI1NTg3ODQxLCJpYXQiOjE2MjU1ODc4NDEsInJvbGUiOiJNb2RlcmF0b3IiLCJleHAiOjE2MjU1OTUwNDEsImlzcyI6IkNPVklEVHJpYWdlIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3QifQ.noNVecZkYnQHCpGBCKA-mjHt-qk8HwMK0U63Kjj49F0'
                              }
                            })
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
    })
  }
}

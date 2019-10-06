import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = true;
  private _userId = 'def';

  constructor() { }

  get isAuthenticated(){
    return this._isAuthenticated;
  }

  get userId() {
    return this._userId;
  }

  logout(){
    this._isAuthenticated = false;
  }

  login(){
    this._isAuthenticated = true;
  }
}

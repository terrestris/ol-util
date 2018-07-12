var fs = require('fs');
var basic = require('./data/watershed');
var char11 = require('./data/watershed-11chars');
var specialChar = require('./data/watershed-specialCharacters');
var utf = [
  {
    field: '💩'
  },
  {
    field: 'Hněvošický háj'
  }
]
var dbf = require('../');
require('chai').should();
function toArrayBuffer(buffer) {
    return buffer;
}
describe('dbf',function(){
	it('should work',function(done){
		fs.readFile('./test/data/watershed.dbf',function(err,data){
			if(err){
				return done(err);
			}
			dbf(data).should.deep.equal(basic);
			done();
		});
	});
  it('should handle 11 charicter field names',function(done){
		fs.readFile('./test/data/watershed-11chars.dbf',function(err,data){
			if(err){
				return done(err);
			}
			dbf(data).should.deep.equal(char11);
			done();
		});
	});
  it('should handle special characters',function(done){
    fs.readFile('./test/data/watershed-specialCharacters.dbf',function(err,data){
      if(err){
        return done(err);
      }
      dbf(data).should.deep.equal(specialChar);
      done();
    });
  });
  it('should handle an empty / null dbf file',function(done){
    fs.readFile('./test/data/empty.dbf',function(err,data){
      if(err){
        return done(err);
      }
      dbf(data).should.deep.equal([{}, {}]);
      done();
    });
  });
  it('should handle utf charicters',function(done){
    fs.readFile('./test/data/utf.dbf',function(err,data){
      if(err){
        return done(err);
      }
      dbf(data).should.deep.equal(utf);
      dbf(data, 'UTF-8').should.deep.equal(utf);
      done();
    });
  });
  it('should handle other charicters',function(done){
    fs.readFile('./test/data/codepage.dbf',function(err,data){
      if(err){
        return done(err);
      }
      dbf(data)[1].should.not.deep.equal(utf[1]);
      dbf(data, '1250')[1].should.deep.equal(utf[1]);
      dbf(data, 'ASNI 1250')[1].should.deep.equal(utf[1]);
      dbf(data, 'windows-1250')[1].should.deep.equal(utf[1]);
      done();
    });
  });
});
